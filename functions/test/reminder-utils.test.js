const test = require("node:test");
const assert = require("node:assert/strict");
const {
  addMonthsSafe,
  buildReminderEventId,
  clampReminderDays,
  computeNextPaymentDate,
  daysUntilInTimeZone,
} = require("../src/reminder-utils");

test("clampReminderDays keeps value in [1, 15]", () => {
  assert.equal(clampReminderDays(0), 1);
  assert.equal(clampReminderDays(16), 15);
  assert.equal(clampReminderDays(7.2), 7);
});

test("daysUntilInTimeZone uses calendar days in timezone", () => {
  const now = new Date("2026-02-27T23:00:00.000Z");
  const target = new Date("2026-02-28T04:00:00.000Z");
  const days = daysUntilInTimeZone(now, target, "America/Bogota");
  assert.equal(days, 0);
});

test("addMonthsSafe handles short months and leap years", () => {
  const jan31 = new Date(Date.UTC(2025, 0, 31));
  const next = addMonthsSafe(jan31, 1);
  assert.equal(next.toISOString().slice(0, 10), "2025-02-28");
});

test("computeNextPaymentDate infers monthly cadence from history", () => {
  const next = computeNextPaymentDate({
    paymentDate: new Date("2026-03-31T12:00:00.000Z"),
    subscription: {},
    paymentHistoryDates: [
      new Date("2026-02-28T12:00:00.000Z"),
      new Date("2026-01-31T12:00:00.000Z"),
    ],
  });
  assert.equal(next.toISOString().slice(0, 10), "2026-04-30");
});

test("buildReminderEventId includes subscription, date and reminder", () => {
  const eventId = buildReminderEventId("netflix", new Date("2026-05-12T00:00:00.000Z"), 5);
  assert.equal(eventId, "netflix-2026-05-12-5d");
});
