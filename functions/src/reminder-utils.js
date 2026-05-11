function clampReminderDays(value) {
  if (!Number.isFinite(value)) {
    return 3;
  }
  return Math.min(15, Math.max(1, Math.round(value)));
}

function toDateFromUnknown(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function datePartsInTimeZone(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return { year, month, day };
}

function dateKeyInTimeZone(date, timeZone) {
  const { year, month, day } = datePartsInTimeZone(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toEpochDay(date, timeZone) {
  const { year, month, day } = datePartsInTimeZone(date, timeZone);
  return Math.round(Date.UTC(year, month - 1, day) / 86400000);
}

function daysUntilInTimeZone(now, target, timeZone) {
  return toEpochDay(target, timeZone) - toEpochDay(now, timeZone);
}

function endOfMonthUtc(year, monthIndexZeroBased) {
  return new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate();
}

function addMonthsSafe(date, months) {
  const source = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const sourceDay = source.getUTCDate();
  const targetMonth = source.getUTCMonth() + months;
  const targetYear = source.getUTCFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const maxDay = endOfMonthUtc(targetYear, normalizedMonth);
  const targetDay = Math.min(sourceDay, maxDay);
  return new Date(Date.UTC(targetYear, normalizedMonth, targetDay));
}

function addYearsSafe(date, years) {
  const source = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const targetYear = source.getUTCFullYear() + years;
  const maxDay = endOfMonthUtc(targetYear, source.getUTCMonth());
  const targetDay = Math.min(source.getUTCDate(), maxDay);
  return new Date(Date.UTC(targetYear, source.getUTCMonth(), targetDay));
}

function addDaysUtc(date, days) {
  const source = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  source.setUTCDate(source.getUTCDate() + days);
  return source;
}

function inferCadenceFromSubscription(subscription) {
  const rawCycle = typeof subscription.billingCycle === "string" ? subscription.billingCycle.toLowerCase() : "";
  if (rawCycle === "weekly") {
    return { unit: "week", value: 1 };
  }
  if (rawCycle === "monthly") {
    return { unit: "month", value: 1 };
  }
  if (rawCycle === "yearly" || rawCycle === "annual") {
    return { unit: "year", value: 1 };
  }
  if (rawCycle === "quarterly") {
    return { unit: "month", value: 3 };
  }
  if (rawCycle === "custom" && Number.isFinite(Number(subscription.billingIntervalDays))) {
    return { unit: "day", value: Math.max(1, Math.round(Number(subscription.billingIntervalDays))) };
  }
  return null;
}

function inferCadenceFromHistory(historyDates) {
  if (!Array.isArray(historyDates) || historyDates.length < 2) {
    return null;
  }
  const sorted = [...historyDates]
    .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());
  if (sorted.length < 2) {
    return null;
  }
  const deltas = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const delta = Math.round((sorted[index - 1].getTime() - sorted[index].getTime()) / 86400000);
    if (delta > 0) {
      deltas.push(delta);
    }
  }
  if (deltas.length === 0) {
    return null;
  }
  const average = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  if (average >= 360 && average <= 370) {
    return { unit: "year", value: 1 };
  }
  if (average >= 84 && average <= 96) {
    return { unit: "month", value: 3 };
  }
  if (average >= 27 && average <= 33) {
    return { unit: "month", value: 1 };
  }
  if (average >= 6 && average <= 8) {
    return { unit: "week", value: 1 };
  }
  return { unit: "day", value: Math.max(1, Math.round(average)) };
}

function applyCadence(baseDate, cadence) {
  if (cadence.unit === "year") {
    return addYearsSafe(baseDate, cadence.value);
  }
  if (cadence.unit === "month") {
    return addMonthsSafe(baseDate, cadence.value);
  }
  if (cadence.unit === "week") {
    return addDaysUtc(baseDate, cadence.value * 7);
  }
  return addDaysUtc(baseDate, cadence.value);
}

function computeNextPaymentDate({ paymentDate, subscription, paymentHistoryDates = [] }) {
  const basePaymentDate = toDateFromUnknown(paymentDate);
  if (!basePaymentDate) {
    return null;
  }

  const fromSubscription = inferCadenceFromSubscription(subscription || {});
  const fromHistory = inferCadenceFromHistory(paymentHistoryDates);
  const cadence = fromSubscription || fromHistory || { unit: "month", value: 1 };

  let nextDate = applyCadence(basePaymentDate, cadence);
  if (nextDate.getTime() <= basePaymentDate.getTime()) {
    nextDate = addMonthsSafe(basePaymentDate, 1);
  }
  return nextDate;
}

function buildReminderEventId(subscriptionId, paymentDate, reminderDays) {
  const label = paymentDate.toISOString().slice(0, 10);
  return `${subscriptionId}-${label}-${reminderDays}d`;
}

module.exports = {
  addDaysUtc,
  addMonthsSafe,
  addYearsSafe,
  buildReminderEventId,
  clampReminderDays,
  computeNextPaymentDate,
  dateKeyInTimeZone,
  daysUntilInTimeZone,
  toDateFromUnknown,
};
