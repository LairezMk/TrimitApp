const crypto = require("node:crypto");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const {
  buildReminderEventId,
  clampReminderDays,
  computeNextPaymentDate,
  dateKeyInTimeZone,
  daysUntilInTimeZone,
  toDateFromUnknown,
} = require("./src/reminder-utils");

admin.initializeApp();
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const REGION = "southamerica-east1";
const MAX_DAILY_REMINDERS_PER_USER = 3;
const MAX_RETRY_ATTEMPTS = 3;
const TRIMIT_UNSUBSCRIBE_BASE_URL = defineString("TRIMIT_UNSUBSCRIBE_BASE_URL", {
  default: "https://southamerica-east1-trimitapp.cloudfunctions.net/unsubscribePaymentReminders",
});

function toCurrencyCode(currency) {
  if (currency === "USD" || currency === "EUR" || currency === "COP") {
    return currency;
  }
  return "COP";
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: toCurrencyCode(currency),
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(Number(amount || 0));
}

function formatDate(value, timeZone) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(value);
}

function isReminderEnabled(preferences) {
  return (
    Boolean(preferences?.emailEnabled) &&
    Boolean(preferences?.paymentReminderEmail5d) &&
    Boolean(preferences?.paymentReminderEmailConsent?.acceptedAt) &&
    !Boolean(preferences?.paymentReminderEmailUnsubscribed)
  );
}

function buildReminderTemplate({
  userName,
  subscriptionName,
  amountLabel,
  paymentDateLabel,
  daysBefore,
  unsubscribeUrl,
}) {
  const subject = `Recordatorio Trimit: ${subscriptionName} vence en ${daysBefore} día(s)`;
  const text = [
    `Hola ${userName},`,
    "",
    `Tu suscripción "${subscriptionName}" se cobrará en ${daysBefore} día(s).`,
    `Valor: ${amountLabel}`,
    `Fecha estimada de cobro: ${paymentDateLabel}`,
    "",
    `Si no deseas más recordatorios por correo, desactívalos aquí: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `
<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f4fbf8;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d1fae5;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px;background:linear-gradient(120deg,#10b981,#06b6d4);color:#ffffff;">
                <h1 style="margin:0;font-size:22px;font-weight:700;">Trimit</h1>
                <p style="margin:8px 0 0 0;font-size:14px;opacity:0.92;">Recordatorio de pago programado</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px 0;font-size:16px;">Hola <strong>${userName}</strong>,</p>
                <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#475569;">
                  Este es un recordatorio de Trimit para que tengas control total sobre tus renovaciones.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #cdeee1;border-radius:12px;background:#ecfdf5;">
                  <tr>
                    <td style="padding:16px;">
                      <p style="margin:0 0 8px 0;font-size:12px;color:#065f46;text-transform:uppercase;letter-spacing:.08em;">Suscripción</p>
                      <p style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#064e3b;">${subscriptionName}</p>
                      <p style="margin:0 0 6px 0;font-size:13px;color:#065f46;">Valor: <strong style="color:#064e3b;">${amountLabel}</strong></p>
                      <p style="margin:0;font-size:13px;color:#065f46;">Fecha estimada de cobro: <strong style="color:#064e3b;">${paymentDateLabel}</strong></p>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0 0;font-size:13px;color:#64748b;">
                  Enviado automáticamente por Trimit cuando faltan ${daysBefore} día(s) para tu próximo cobro.
                </p>
                <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">
                  ¿No deseas más estos correos?
                  <a href="${unsubscribeUrl}" style="color:#0f766e;text-decoration:underline;">Darme de baja</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  return { subject, text, html };
}

async function incrementMetrics(dateKey, patch) {
  const metricsRef = db.collection("operations").doc("emailReminderMetrics").collection("daily").doc(dateKey);
  const payload = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  Object.entries(patch).forEach(([key, value]) => {
    payload[key] = FieldValue.increment(value);
  });
  await metricsRef.set(payload, { merge: true });
}

async function ensureUnsubscribeToken(userRef, preferences) {
  if (typeof preferences.paymentReminderEmailUnsubscribeToken === "string" && preferences.paymentReminderEmailUnsubscribeToken) {
    return preferences.paymentReminderEmailUnsubscribeToken;
  }
  const token = crypto.randomBytes(20).toString("hex");
  await userRef.set(
    {
      preferences: {
        paymentReminderEmailUnsubscribeToken: token,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return token;
}

exports.schedulePaymentReminderEmails = onSchedule(
  {
    schedule: "every 6 hours",
    region: REGION,
    timeZone: "Etc/UTC",
    memory: "512MiB",
  },
  async () => {
    const now = new Date();
    const runDateKey = dateKeyInTimeZone(now, "Etc/UTC");
    const usersSnapshot = await db.collection("users").where("status", "==", "active").get();

    let queued = 0;
    let duplicates = 0;
    let skippedByRateLimit = 0;
    let skippedByPreferences = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() || {};
      const preferences = userData.preferences || {};
      if (!isReminderEnabled(preferences)) {
        skippedByPreferences += 1;
        continue;
      }

      const email = String(userData.email || "").trim();
      if (!email) {
        skippedByPreferences += 1;
        continue;
      }

      const reminderDays = clampReminderDays(Number(preferences.reminderDays ?? 3));
      const timeZone = typeof userData.timezone === "string" ? userData.timezone : "America/Bogota";
      const displayName = String(userData.displayName || "Usuario").trim() || "Usuario";
      const unsubscribeToken = await ensureUnsubscribeToken(userDoc.ref, preferences);
      const subscriptionsSnapshot = await userDoc.ref
        .collection("subscriptions")
        .where("status", "==", "active")
        .get();
      const userDateKey = dateKeyInTimeZone(now, timeZone);
      const userRateRef = userDoc.ref.collection("emailReminderRateLimit").doc(userDateKey);

      for (const subscriptionDoc of subscriptionsSnapshot.docs) {
        if (subscriptionDoc.id === "_meta") {
          continue;
        }
        const subscription = subscriptionDoc.data() || {};
        const paymentDate = toDateFromUnknown(subscription.nextPaymentDate);
        if (!paymentDate) {
          continue;
        }
        const daysUntil = daysUntilInTimeZone(now, paymentDate, timeZone);
        if (daysUntil !== reminderDays) {
          continue;
        }

        const eventId = buildReminderEventId(subscriptionDoc.id, paymentDate, reminderDays);
        const eventRef = userDoc.ref.collection("emailReminderEvents").doc(eventId);
        const unsubscribeUrl = `${TRIMIT_UNSUBSCRIBE_BASE_URL.value()}?uid=${encodeURIComponent(userDoc.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
        const template = buildReminderTemplate({
          userName: displayName,
          subscriptionName: String(subscription.name || "Suscripción"),
          amountLabel: formatAmount(subscription.amount, subscription.currency),
          paymentDateLabel: formatDate(paymentDate, timeZone),
          daysBefore: reminderDays,
          unsubscribeUrl,
        });

        const txResult = await db.runTransaction(async (tx) => {
          const [eventSnapshot, rateSnapshot] = await Promise.all([tx.get(eventRef), tx.get(userRateRef)]);
          if (eventSnapshot.exists) {
            return "duplicate";
          }
          const sentToday = Number(rateSnapshot.data()?.count || 0);
          if (sentToday >= MAX_DAILY_REMINDERS_PER_USER) {
            return "rate_limited";
          }

          const mailRef = db.collection("mail").doc();
          tx.set(mailRef, {
            to: [email],
            message: {
              subject: template.subject,
              text: template.text,
              html: template.html,
            },
            meta: {
              type: "subscription_payment_reminder",
              uid: userDoc.id,
              eventId,
              attempt: 1,
              subscriptionId: subscriptionDoc.id,
              subscriptionName: String(subscription.name || "Suscripción"),
              daysBefore: reminderDays,
              currency: String(subscription.currency || "COP"),
              amount: Number(subscription.amount || 0),
            },
            createdAt: FieldValue.serverTimestamp(),
          });

          tx.set(eventRef, {
            uid: userDoc.id,
            state: "queued",
            eventId,
            attempts: 1,
            createdAt: FieldValue.serverTimestamp(),
            lastAttemptAt: FieldValue.serverTimestamp(),
            reminderDays,
            timezone: timeZone,
            subscriptionId: subscriptionDoc.id,
            subscriptionName: String(subscription.name || "Suscripción"),
            amount: Number(subscription.amount || 0),
            currency: String(subscription.currency || "COP"),
            scheduledFor: paymentDate,
            to: email,
          });

          tx.set(
            userRateRef,
            {
              count: sentToday + 1,
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
          return "queued";
        });

        if (txResult === "queued") {
          queued += 1;
        } else if (txResult === "duplicate") {
          duplicates += 1;
        } else if (txResult === "rate_limited") {
          skippedByRateLimit += 1;
        }
      }
    }

    await incrementMetrics(runDateKey, {
      queued,
      duplicates,
      skippedByRateLimit,
      skippedByPreferences,
      schedulerRuns: 1,
    });
    logger.info("schedulePaymentReminderEmails completed", {
      queued,
      duplicates,
      skippedByRateLimit,
      skippedByPreferences,
      usersEvaluated: usersSnapshot.size,
      runDateKey,
    });
  },
);

exports.onMailDeliveryStateChanged = onDocumentWritten(
  {
    document: "mail/{mailId}",
    region: REGION,
  },
  async (event) => {
    const afterData = event.data.after.exists ? event.data.after.data() : null;
    if (!afterData || !afterData.meta || afterData.meta.type !== "subscription_payment_reminder") {
      return;
    }

    const deliveryState = String(afterData.delivery?.state || "").toUpperCase();
    if (deliveryState !== "SUCCESS" && deliveryState !== "ERROR" && deliveryState !== "FAILED") {
      return;
    }

    const uid = String(afterData.meta.uid || "");
    const eventId = String(afterData.meta.eventId || "");
    if (!uid || !eventId) {
      return;
    }

    const reminderRef = db.collection("users").doc(uid).collection("emailReminderEvents").doc(eventId);
    const reminderSnapshot = await reminderRef.get();
    if (!reminderSnapshot.exists) {
      return;
    }
    const reminderData = reminderSnapshot.data() || {};
    if (reminderData.lastProcessedMailId === event.params.mailId) {
      return;
    }

    const dateKey = dateKeyInTimeZone(new Date(), "Etc/UTC");
    if (deliveryState === "SUCCESS") {
      await reminderRef.set(
        {
          state: "sent",
          sentAt: FieldValue.serverTimestamp(),
          lastProcessedMailId: event.params.mailId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      await incrementMetrics(dateKey, { sent: 1 });
      return;
    }

    const currentAttempts = Number(reminderData.attempts || afterData.meta.attempt || 1);
    const lastError = String(
      afterData.delivery?.error?.message ||
        afterData.delivery?.error?.code ||
        "Error desconocido al enviar correo",
    );

    if (currentAttempts >= MAX_RETRY_ATTEMPTS) {
      await reminderRef.set(
        {
          state: "failed",
          lastError,
          failedAt: FieldValue.serverTimestamp(),
          lastProcessedMailId: event.params.mailId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      await incrementMetrics(dateKey, { failed: 1 });
      return;
    }

    const retryAttempt = currentAttempts + 1;
    const retryMailRef = db.collection("mail").doc();
    const toList = Array.isArray(afterData.to) ? afterData.to : [];
    await db.runTransaction(async (tx) => {
      tx.set(retryMailRef, {
        to: toList,
        message: afterData.message,
        meta: {
          ...afterData.meta,
          attempt: retryAttempt,
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(
        reminderRef,
        {
          state: "retried",
          attempts: retryAttempt,
          lastError,
          retriedAt: FieldValue.serverTimestamp(),
          lastAttemptAt: FieldValue.serverTimestamp(),
          lastProcessedMailId: event.params.mailId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });
    await incrementMetrics(dateKey, { retried: 1 });
  },
);

exports.unsubscribePaymentReminders = onRequest(
  {
    region: REGION,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).send("Método no permitido");
      return;
    }

    const uid = String(req.query.uid || "");
    const token = String(req.query.token || "");
    if (!uid || !token) {
      res.status(400).send("Solicitud inválida");
      return;
    }

    const userRef = db.collection("users").doc(uid);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      res.status(404).send("Usuario no encontrado");
      return;
    }
    const userData = snapshot.data() || {};
    const preferences = userData.preferences || {};
    const expectedToken = String(preferences.paymentReminderEmailUnsubscribeToken || "");
    if (!expectedToken || expectedToken !== token) {
      res.status(403).send("Token inválido");
      return;
    }

    await userRef.set(
      {
        preferences: {
          paymentReminderEmail5d: false,
          paymentReminderEmailUnsubscribed: true,
          paymentReminderEmailConsent: {
            revokedAt: FieldValue.serverTimestamp(),
            source: "unsubscribe_link",
          },
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await userRef.collection("emailReminderConsentLogs").add({
      action: "unsubscribe",
      source: "email_link",
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(200).send(`
      <!doctype html>
      <html lang="es">
        <body style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f0fdf4;margin:0;padding:32px;color:#064e3b;">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:28px;border:1px solid #a7f3d0;">
            <h1 style="margin:0 0 12px 0;">Has sido dado de baja</h1>
            <p style="margin:0;color:#065f46;">Ya no recibirás recordatorios de pago por correo en Trimit.</p>
          </div>
        </body>
      </html>
    `);
  },
);

exports.recalculateNextPaymentDate = onDocumentCreated(
  {
    document: "users/{uid}/payments/{paymentId}",
    region: REGION,
    memory: "256MiB",
  },
  async (event) => {
    const paymentId = event.params.paymentId;
    if (paymentId === "_meta") {
      return;
    }
    const payment = event.data.data() || {};
    if (String(payment.status || "paid") !== "paid") {
      return;
    }

    const subscriptionId = String(payment.subscriptionId || "");
    if (!subscriptionId) {
      return;
    }

    const uid = String(event.params.uid);
    const userRef = db.collection("users").doc(uid);
    const subscriptionRef = userRef.collection("subscriptions").doc(subscriptionId);
    const subscriptionSnapshot = await subscriptionRef.get();
    if (!subscriptionSnapshot.exists) {
      return;
    }
    const subscription = subscriptionSnapshot.data() || {};
    if (!Boolean(subscription.isRecurring)) {
      return;
    }

    const paymentDate = toDateFromUnknown(payment.paymentDate) || new Date();
    const recentPaymentsSnapshot = await userRef
      .collection("payments")
      .orderBy("paymentDate", "desc")
      .limit(30)
      .get();
    const historyDates = recentPaymentsSnapshot.docs
      .filter((doc) => doc.id !== "_meta")
      .map((doc) => doc.data())
      .filter((item) => String(item.subscriptionId || "") === subscriptionId && String(item.status || "paid") === "paid")
      .map((item) => toDateFromUnknown(item.paymentDate))
      .filter(Boolean);

    const nextPaymentDate = computeNextPaymentDate({
      paymentDate,
      subscription,
      paymentHistoryDates: historyDates,
    });
    if (!nextPaymentDate) {
      return;
    }

    await subscriptionRef.set(
      {
        nextPaymentDate,
        lastPaymentAt: paymentDate,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await userRef.collection("paymentScheduleAudits").add({
      paymentId,
      subscriptionId,
      paymentDate,
      computedNextPaymentDate: nextPaymentDate,
      source: "functions-recurrence",
      createdAt: FieldValue.serverTimestamp(),
    });
  },
);
