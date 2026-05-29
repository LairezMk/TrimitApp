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
  actionUrl,
  isManual = false,
}) {
  const appUrl = actionUrl || TRIMIT_APP_URL.value().replace(/\/$/, "");
  const safeDaysBefore = Math.max(0, Number(daysBefore || 0));
  const timingLabel =
    safeDaysBefore === 0
      ? "hoy"
      : `en ${safeDaysBefore} día${safeDaysBefore === 1 ? "" : "s"}`;
  const subject = isManual
    ? `Prueba de recordatorio Trimit: ${subscriptionName}`
    : `Recordatorio Trimit: ${subscriptionName} vence ${timingLabel}`;
  const text = [
    `Hola ${userName},`,
    "",
    isManual
      ? "Este es un correo de prueba enviado desde Trimit para comprobar tus recordatorios."
      : `Tu suscripción "${subscriptionName}" se cobrará ${timingLabel}.`,
    `Valor: ${amountLabel}`,
    `Fecha estimada de cobro: ${paymentDateLabel}`,
    "",
    `Puedes revisar este recordatorio en Trimit: ${appUrl}`,
    "",
    `Si no deseas más recordatorios por correo, desactívalos aquí: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>${subject}</title>
  </head>
  <body style="margin:0;background:#ecfdf7;font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${isManual ? "Correo de prueba de tus recordatorios Trimit." : `Tu próximo pago de ${subscriptionName} está programado para ${paymentDateLabel}.`}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#ecfdf7;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #bdebd8;border-radius:22px;overflow:hidden;box-shadow:0 22px 55px rgba(6,78,59,.12);">
            <tr>
              <td style="padding:28px;background:#052e2b;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size:24px;font-weight:900;letter-spacing:.2px;">Trimit</div>
                      <div style="margin-top:7px;font-size:13px;color:#99f6e4;">Control claro de tus pagos recurrentes</div>
                    </td>
                    <td align="right">
                      <span style="display:inline-block;border:1px solid rgba(153,246,228,.45);border-radius:999px;padding:8px 12px;font-size:12px;color:#ccfbf1;">
                        ${isManual ? "Correo de prueba" : "Recordatorio"}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 12px 28px;">
                <h1 style="margin:0 0 12px 0;font-size:27px;line-height:1.25;color:#0f172a;">
                  ${isManual ? "Tu correo de recordatorio funciona" : `Pago próximo ${timingLabel}`}
                </h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
                  Hola <strong>${userName}</strong>, ${
                    isManual
                      ? "enviamos esta prueba para validar que los recordatorios por correo están activos."
                      : "te avisamos con tiempo para que puedas revisar tu próximo cobro sin sorpresas."
                  }
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 10px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #bbf7d0;border-radius:18px;background:#f0fdf4;">
                  <tr>
                    <td style="padding:20px;">
                      <p style="margin:0 0 8px 0;font-size:12px;font-weight:800;color:#047857;text-transform:uppercase;letter-spacing:.08em;">Suscripción</p>
                      <p style="margin:0 0 18px 0;font-size:22px;font-weight:900;color:#064e3b;">${subscriptionName}</p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding:12px;border-radius:14px;background:#ffffff;border:1px solid #d1fae5;">
                            <p style="margin:0 0 5px 0;font-size:12px;color:#64748b;">Valor estimado</p>
                            <p style="margin:0;font-size:20px;font-weight:900;color:#0f766e;">${amountLabel}</p>
                          </td>
                          <td width="12"></td>
                          <td style="padding:12px;border-radius:14px;background:#ffffff;border:1px solid #d1fae5;">
                            <p style="margin:0 0 5px 0;font-size:12px;color:#64748b;">Fecha de cobro</p>
                            <p style="margin:0;font-size:16px;font-weight:800;color:#0f172a;">${paymentDateLabel}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 4px 28px;">
                <a href="${appUrl}" style="display:block;text-align:center;background:#10b981;color:#ffffff;text-decoration:none;border-radius:14px;padding:15px 20px;font-size:15px;font-weight:900;box-shadow:0 12px 26px rgba(16,185,129,.24);">Abrir Trimit</a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 30px 28px;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                  ${isManual ? "Este envío no cambia la fecha ni el estado del recordatorio." : `Enviado por Trimit cuando faltan ${safeDaysBefore} día(s) para tu próximo cobro.`}
                </p>
                <p style="margin:12px 0 0 0;font-size:12px;line-height:1.6;color:#64748b;">
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

function buildTransactionalMessageOptions({ messageType = "transactional", unsubscribeUrl } = {}) {
  const options = {
    headers: {
      "X-Auto-Response-Suppress": "All",
      "Auto-Submitted": "auto-generated",
      "X-Trimit-Message-Type": messageType,
    },
  };
  if (unsubscribeUrl) {
    options.headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
    options.headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
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
  const messageOptions = buildTransactionalMessageOptions({
    messageType: meta.type || "transactional",
    unsubscribeUrl: meta.unsubscribeUrl,
  });
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

function getReminderSendPlan({ reminder, now, paymentDate, timeZone, fallbackReminderDays }) {
  const mode = String(reminder.emailMode || "none");
  const daysUntil = daysUntilInTimeZone(now, paymentDate, timeZone);

  if (mode === "once") {
    const emailDate = toDateFromUnknown(reminder.emailOnceDate);
    if (!emailDate || dateKeyInTimeZone(now, timeZone) !== dateKeyInTimeZone(emailDate, timeZone)) {
      return null;
    }
    return { mode, reminderDays: Math.max(0, daysUntil) };
  }

  if (mode === "interval") {
    const intervalDays = Math.max(1, Math.round(Number(reminder.emailIntervalDays || 1)));
    if (daysUntil < 0 || daysUntil % intervalDays !== 0) {
      return null;
    }
    return { mode, reminderDays: daysUntil };
  }

  if (mode === "days_before") {
    const reminderDays = clampReminderDays(Number(reminder.daysBeforeReminder ?? fallbackReminderDays));
    if (daysUntil !== reminderDays) {
      return null;
    }
    return { mode, reminderDays };
  }

  return null;
}

function buildEmailReminderEventId({ subscriptionId, reminderId, paymentDate, reminderDays, mode }) {
  const label = paymentDate.toISOString().slice(0, 10);
  return `${subscriptionId}-${reminderId || "global"}-${label}-${mode}-${reminderDays}d`;
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
      const remindersSnapshot = await userDoc.ref
        .collection("reminders")
        .where("enabled", "==", true)
        .get();
      const userDateKey = dateKeyInTimeZone(now, timeZone);
      const userRateRef = userDoc.ref.collection("emailReminderRateLimit").doc(userDateKey);
      const subscriptionsById = new Map();

      for (const subscriptionDoc of subscriptionsSnapshot.docs) {
        if (subscriptionDoc.id !== "_meta") {
          subscriptionsById.set(subscriptionDoc.id, subscriptionDoc.data() || {});
        }
      }

      const emailReminderDocs = remindersSnapshot.docs.filter((reminderDoc) => {
        const reminder = reminderDoc.data() || {};
        const mode = String(reminder.emailMode || "none");
        return reminderDoc.id !== "_meta" && mode !== "none";
      });
      const candidates = [];

      if (emailReminderDocs.length > 0) {
        for (const reminderDoc of emailReminderDocs) {
          const reminder = reminderDoc.data() || {};
          const subscriptionId = String(reminder.subscriptionId || "");
          const subscription = subscriptionsById.get(subscriptionId);
          if (!subscription) {
            continue;
          }
          const paymentDate =
            toDateFromUnknown(reminder.date) || toDateFromUnknown(subscription.nextPaymentDate);
          if (!paymentDate) {
            continue;
          }

          const plan = getReminderSendPlan({
            reminder,
            now,
            paymentDate,
            timeZone,
            fallbackReminderDays: reminderDays,
          });
          if (!plan) {
            continue;
          }

          candidates.push({
            subscriptionId,
            subscription,
            paymentDate,
            reminderId: reminderDoc.id,
            mode: plan.mode,
            reminderDays: plan.reminderDays,
          });
        }
      } else {
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

          candidates.push({
            subscriptionId: subscriptionDoc.id,
            subscription,
            paymentDate,
            reminderId: "global",
            mode: "global",
            reminderDays,
          });
        }
      }

      for (const candidate of candidates) {
        const { subscription, subscriptionId, paymentDate, reminderId, mode, reminderDays: candidateReminderDays } = candidate;
        const eventId =
          mode === "global"
            ? buildReminderEventId(subscriptionId, paymentDate, candidateReminderDays)
            : buildEmailReminderEventId({
                subscriptionId,
                reminderId,
                paymentDate,
                reminderDays: candidateReminderDays,
                mode,
              });
        const eventRef = userDoc.ref.collection("emailReminderEvents").doc(eventId);
        const unsubscribeUrl = `${TRIMIT_UNSUBSCRIBE_BASE_URL.value()}?uid=${encodeURIComponent(userDoc.id)}&token=${encodeURIComponent(unsubscribeToken)}`;
        const template = buildReminderTemplate({
          userName: displayName,
          subscriptionName: String(subscription.name || "Suscripción"),
          amountLabel: formatAmount(subscription.amount, subscription.currency),
          paymentDateLabel: formatDate(paymentDate, timeZone),
          daysBefore: candidateReminderDays,
          unsubscribeUrl,
          actionUrl: `${TRIMIT_APP_URL.value().replace(/\/$/, "")}/notifications`,
        });
        const messageOptions = buildTransactionalMessageOptions({
          messageType: "subscription_payment_reminder",
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
              ...messageOptions,
              subject: template.subject,
              text: template.text,
              html: template.html,
            },
            meta: {
              type: "subscription_payment_reminder",
              uid: userDoc.id,
              eventId,
              attempt: 1,
              subscriptionId,
              reminderId,
              reminderMode: mode,
              subscriptionName: String(subscription.name || "Suscripción"),
              daysBefore: candidateReminderDays,
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
            reminderDays: candidateReminderDays,
            reminderId,
            reminderMode: mode,
            timezone: timeZone,
            subscriptionId,
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

exports.sendReminderEmailNow = onCall(
  {
    region: REGION,
    memory: "256MiB",
    secrets: [TRIMIT_SMTP_PASS],
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Inicia sesión para enviar el recordatorio.");
    }

    const reminderId = String(request.data?.reminderId || "").trim();
    if (!reminderId) {
      throw new HttpsError("invalid-argument", "Selecciona un recordatorio válido.");
    }

    const userRef = db.collection("users").doc(uid);
    const [userSnapshot, reminderSnapshot] = await Promise.all([
      userRef.get(),
      userRef.collection("reminders").doc(reminderId).get(),
    ]);
    if (!userSnapshot.exists) {
      throw new HttpsError("not-found", "No encontramos tu perfil de Trimit.");
    }
    if (!reminderSnapshot.exists) {
      throw new HttpsError("not-found", "No encontramos este recordatorio.");
    }

    const userData = userSnapshot.data() || {};
    const preferences = userData.preferences || {};
    if (preferences.paymentReminderEmailUnsubscribed) {
      throw new HttpsError(
        "failed-precondition",
        "Reactiva los recordatorios por correo antes de enviar una prueba.",
      );
    }

    const email = String(userData.email || request.auth?.token?.email || "").trim().toLowerCase();
    if (!email) {
      throw new HttpsError("failed-precondition", "Tu perfil no tiene un correo válido.");
    }

    const reminder = reminderSnapshot.data() || {};
    if (String(reminder.emailMode || "none") === "none") {
      throw new HttpsError(
        "failed-precondition",
        "Activa el recordatorio por correo antes de enviar una prueba.",
      );
    }

    const subscriptionId = String(reminder.subscriptionId || "").trim();
    if (!subscriptionId) {
      throw new HttpsError("failed-precondition", "El recordatorio no tiene una suscripción asociada.");
    }

    const subscriptionSnapshot = await userRef.collection("subscriptions").doc(subscriptionId).get();
    if (!subscriptionSnapshot.exists) {
      throw new HttpsError("not-found", "No encontramos la suscripción de este recordatorio.");
    }

    const subscription = subscriptionSnapshot.data() || {};
    const timeZone = typeof userData.timezone === "string" ? userData.timezone : "America/Bogota";
    const displayName = String(userData.displayName || request.auth?.token?.name || "Usuario").trim() || "Usuario";
    const paymentDate =
      toDateFromUnknown(reminder.date) ||
      toDateFromUnknown(subscription.nextPaymentDate) ||
      new Date();
    const daysBefore = Math.max(0, daysUntilInTimeZone(new Date(), paymentDate, timeZone));
    const unsubscribeToken = await ensureUnsubscribeToken(userRef, preferences);
    const unsubscribeUrl = `${TRIMIT_UNSUBSCRIBE_BASE_URL.value()}?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(unsubscribeToken)}`;
    const subscriptionName = String(subscription.name || reminder.subscriptionName || "Suscripción");
    const template = buildReminderTemplate({
      userName: displayName,
      subscriptionName,
      amountLabel: formatAmount(subscription.amount, subscription.currency),
      paymentDateLabel: formatDate(paymentDate, timeZone),
      daysBefore,
      unsubscribeUrl,
      actionUrl: `${TRIMIT_APP_URL.value().replace(/\/$/, "")}/notifications`,
      isManual: true,
    });
    const eventId = `manual-${reminderId}-${Date.now()}`;

    try {
      const delivery = await sendTransactionalEmail({
        to: email,
        template,
        meta: {
          type: "subscription_payment_reminder",
          source: "manual_reminder_email_test",
          uid,
          eventId,
          attempt: 1,
          subscriptionId,
          reminderId,
          reminderMode: "manual",
          subscriptionName,
          daysBefore,
          currency: String(subscription.currency || "COP"),
          amount: Number(subscription.amount || 0),
          unsubscribeUrl,
        },
      });

      await userRef.collection("emailReminderEvents").doc(eventId).set({
        uid,
        state: delivery.provider === "nodemailer" ? "sent" : "queued",
        eventId,
        attempts: 1,
        createdAt: FieldValue.serverTimestamp(),
        lastAttemptAt: FieldValue.serverTimestamp(),
        sentAt: delivery.provider === "nodemailer" ? FieldValue.serverTimestamp() : null,
        provider: delivery.provider,
        providerMessageId: delivery.messageId || "",
        reminderDays: daysBefore,
        reminderId,
        reminderMode: "manual",
        timezone: timeZone,
        subscriptionId,
        subscriptionName,
        amount: Number(subscription.amount || 0),
        currency: String(subscription.currency || "COP"),
        scheduledFor: paymentDate,
        to: email,
      });

      logger.info("Manual reminder email processed", {
        uid,
        reminderId,
        subscriptionId,
        provider: delivery.provider,
      });
      return { ok: true, provider: delivery.provider };
    } catch (error) {
      logger.error("Could not send manual reminder email", {
        uid,
        reminderId,
        subscriptionId,
        code: error?.code,
        message: error?.message,
      });
      throw new HttpsError("internal", "No se pudo enviar el correo de recordatorio.");
    }
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
