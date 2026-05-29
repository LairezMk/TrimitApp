import { httpsCallable } from "firebase/functions";
import { functions } from "../lib/firebase";

interface SendReminderEmailNowInput {
  reminderId: string;
  toEmail?: string;
  userName?: string;
  subscriptionName?: string;
  amountLabel?: string;
  paymentDateLabel?: string;
  daysBefore?: number;
  appUrl?: string;
}

interface SendReminderEmailNowResult {
  ok: boolean;
  provider?: "emailjs" | "nodemailer" | "mail_collection";
}

const emailJsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
};

function hasEmailJsConfig() {
  return Boolean(emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey);
}

function assertEmailJsPayload(input: SendReminderEmailNowInput) {
  if (!input.toEmail || !input.subscriptionName || !input.amountLabel || !input.paymentDateLabel) {
    throw new Error(
      "Configura los datos del recordatorio antes de enviar el correo por EmailJS.",
    );
  }
}

async function sendWithEmailJs(input: SendReminderEmailNowInput): Promise<SendReminderEmailNowResult> {
  assertEmailJsPayload(input);

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: emailJsConfig.serviceId,
      template_id: emailJsConfig.templateId,
      user_id: emailJsConfig.publicKey,
      template_params: {
        to_email: input.toEmail,
        user_name: input.userName || "Usuario",
        subscription_name: input.subscriptionName,
        amount_label: input.amountLabel,
        payment_date_label: input.paymentDateLabel,
        days_before: String(Math.max(0, Number(input.daysBefore || 0))),
        app_url: input.appUrl || window.location.origin,
        subject: `Recordatorio de pago - ${input.subscriptionName}`,
        preheader: `Pago programado para ${input.paymentDateLabel}.`,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "EmailJS no pudo enviar el correo de recordatorio.");
  }

  return { ok: true, provider: "emailjs" };
}

export async function sendReminderEmailNow(input: SendReminderEmailNowInput) {
  if (hasEmailJsConfig()) {
    return sendWithEmailJs(input);
  }

  const callable = httpsCallable<SendReminderEmailNowInput, SendReminderEmailNowResult>(
    functions,
    "sendReminderEmailNow",
  );
  const result = await callable(input);
  return result.data;
}
