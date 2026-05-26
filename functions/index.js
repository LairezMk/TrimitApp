const crypto = require("node:crypto");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret, defineString } = require("firebase-functions/params");
const nodemailer = require("nodemailer");
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
const TRIMIT_APP_URL = defineString("TRIMIT_APP_URL", {
  default: "https://trimitapp.web.app",
});
const TRIMIT_EMAIL_FROM = defineString("TRIMIT_EMAIL_FROM", {
  default: "",
});
const TRIMIT_EMAIL_REPLY_TO = defineString("TRIMIT_EMAIL_REPLY_TO", {
  default: "",
});
const TRIMIT_SMTP_HOST = defineString("TRIMIT_SMTP_HOST", {
  default: "",
});
const TRIMIT_SMTP_PORT = defineString("TRIMIT_SMTP_PORT", {
  default: "587",
});
const TRIMIT_SMTP_SECURE = defineString("TRIMIT_SMTP_SECURE", {
  default: "false",
});
const TRIMIT_SMTP_USER = defineString("TRIMIT_SMTP_USER", {
  default: "",
});
const TRIMIT_SMTP_PASS = defineSecret("TRIMIT_SMTP_PASS");

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

function buildTransactionalMessageOptions() {
  const options = {
    headers: {
      "X-Auto-Response-Suppress": "All",
      "X-Trimit-Message-Type": "password-reset",
    },
  };
  const from = TRIMIT_EMAIL_FROM.value().trim();
  const replyTo = TRIMIT_EMAIL_REPLY_TO.value().trim();
  if (from) {
    options.from = from;
  }
  if (replyTo) {
    options.replyTo = replyTo;
  }
  return options;
}

function getSmtpConfig() {
  const host = TRIMIT_SMTP_HOST.value().trim();
  const user = TRIMIT_SMTP_USER.value().trim();
  let pass = "";
  try {
    pass = TRIMIT_SMTP_PASS.value().trim();
  } catch {
    pass = "";
  }

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(TRIMIT_SMTP_PORT.value() || 587);
  const secure = TRIMIT_SMTP_SECURE.value().toLowerCase() === "true" || port === 465;
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: { user, pass },
  };
}

async function sendTransactionalEmail({ to, template, meta }) {
  const messageOptions = buildTransactionalMessageOptions();
  const from = messageOptions.from || TRIMIT_SMTP_USER.value().trim();
  const smtpConfig = getSmtpConfig();

  if (smtpConfig && from) {
    const transporter = nodemailer.createTransport(smtpConfig);
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: messageOptions.replyTo,
      subject: template.subject,
      text: template.text,
      html: template.html,
      headers: messageOptions.headers,
    });
    logger.info("Transactional email sent via Nodemailer", {
      type: meta.type,
      providerMessageId: info.messageId,
    });
    return { provider: "nodemailer", messageId: info.messageId };
  }

  await db.collection("mail").add({
    to: [to],
    message: {
      ...messageOptions,
      subject: template.subject,
      text: template.text,
      html: template.html,
    },
    meta: {
      ...meta,
      source: `${meta.source || "trimit"}_mail_collection_fallback`,
    },
    createdAt: FieldValue.serverTimestamp(),
  });
  logger.warn("SMTP is not configured. Queued transactional email in mail collection.", {
    type: meta.type,
  });
  return { provider: "mail_collection" };
}

function buildPasswordResetTemplate({ resetUrl }) {
  const subject = "Restablece tu acceso a Trimit";
  const text = [
    "Hola,",
    "",
    "Recibimos una solicitud para restablecer el acceso a tu cuenta de Trimit.",
    "Para crear una contraseña nueva, abre este enlace seguro:",
    resetUrl,
    "",
    "Por seguridad, el enlace tiene una vigencia limitada.",
    "Si no solicitaste este cambio, ignora este mensaje. Tu cuenta seguirá protegida.",
    "",
    "Equipo Trimit",
  ].join("\n");

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Restablece tu acceso a Trimit</title>
  </head>
  <body style="margin:0;background:#eefaf5;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Crea una contraseña nueva para volver a entrar a Trimit.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#eefaf5;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #bdebd8;border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(15,23,42,.08);">
            <tr>
              <td style="padding:26px 28px;background:#052e2b;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size:24px;font-weight:800;letter-spacing:.2px;">Trimit</div>
                      <div style="margin-top:6px;font-size:13px;color:#a7f3d0;">Gestión segura de tus suscripciones</div>
                    </td>
                    <td align="right" style="font-size:12px;color:#99f6e4;">Recuperación de cuenta</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 10px 28px;">
                <h1 style="margin:0 0 10px 0;font-size:26px;line-height:1.25;color:#0f172a;">Restablece tu contraseña</h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">Recibimos una solicitud para recuperar el acceso a tu cuenta. Haz clic en el botón para crear una contraseña nueva.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 8px 28px;">
                <a href="${resetUrl}" style="display:block;text-align:center;background:#10b981;color:#ffffff;text-decoration:none;border-radius:14px;padding:15px 20px;font-size:15px;font-weight:800;box-shadow:0 12px 26px rgba(16,185,129,.24);">Crear nueva contraseña</a>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #d1fae5;background:#f0fdf4;border-radius:14px;">
                  <tr>
                    <td style="padding:16px;">
                      <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#065f46;">Consejo de seguridad</p>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#047857;">Si no pediste este cambio, ignora este correo. Nadie podrá modificar tu contraseña sin abrir este enlace.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 30px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#64748b;">Si el botón no abre, copia este enlace en tu navegador:</p>
                <p style="margin:0;font-size:12px;line-height:1.6;word-break:break-all;color:#0f766e;">${resetUrl}</p>
                <div style="margin-top:22px;border-top:1px solid #e2e8f0;padding-top:18px;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">Este mensaje fue enviado automáticamente por Trimit para proteger tu cuenta.</p>
                </div>
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

function buildAppPasswordResetUrl(firebaseLink) {
  const parsed = new URL(firebaseLink);
  const appBaseUrl = TRIMIT_APP_URL.value().replace(/\/$/, "");
  const resetUrl = new URL(`${appBaseUrl}/auth/action`);
  for (const key of ["mode", "oobCode", "apiKey", "lang"]) {
    const value = parsed.searchParams.get(key);
    if (value) {
      resetUrl.searchParams.set(key, value);
    }
  }
  resetUrl.searchParams.set("mode", "resetPassword");
  return resetUrl.toString();
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

exports.sendTrimitPasswordResetEmail = onCall(
  {
    region: REGION,
    memory: "256MiB",
    secrets: [TRIMIT_SMTP_PASS],
  },
  async (request) => {
    const email = String(request.data?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError("invalid-argument", "Ingresa un correo válido.");
    }

    try {
      const firebaseLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${TRIMIT_APP_URL.value().replace(/\/$/, "")}/auth/action`,
        handleCodeInApp: true,
      });
      const resetUrl = buildAppPasswordResetUrl(firebaseLink);
      const template = buildPasswordResetTemplate({ resetUrl });

      const delivery = await sendTransactionalEmail({
        to: email,
        template,
        meta: {
          type: "password_reset",
          source: "trimit_custom_auth_email",
        },
      });

      logger.info("Password reset email processed", {
        emailHash: crypto.createHash("sha256").update(email).digest("hex"),
        provider: delivery.provider,
      });
      return { ok: true, provider: delivery.provider };
    } catch (error) {
      if (error?.code === "auth/user-not-found") {
        return { ok: true };
      }
      logger.error("Could not queue password reset email", { code: error?.code, message: error?.message });
      throw new HttpsError("internal", "No se pudo enviar el correo de recuperación.");
    }
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
