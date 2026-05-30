import assert from "node:assert/strict";
import { __gmailDetectionTestUtils } from "../src/app/services/gmailDetection";

const { detectSubscriptionsFromMessages } = __gmailDetectionTestUtils;

function message(overrides: {
  id: string;
  from: string;
  subject: string;
  body: string;
  snippet?: string;
  date?: Date;
}) {
  return {
    snippet: "",
    date: new Date(2026, 4, 1),
    ...overrides,
  };
}

const detected = detectSubscriptionsFromMessages(
  [
    message({
      id: "movistar",
      from: "Facturas Movistar <facturasmovistar@mailc.movistar.co>",
      subject:
        "830122566;COLOMBIA TELECOMUNICACIONES S.A. E.S.P. BIC;BEC520157242;01;MOVISTAR COLOMBIA",
      body:
        "Esta es la factura de tu Servicio Internet Banda Ancha. Total a pagar $ 67.990. Vencimiento: 26 / abril / 2026. Pago automático disponible.",
    }),
    message({
      id: "chatgpt",
      from: "OpenAI <noreply@tm.openai.com>",
      subject: "Your ChatGPT subscription payment receipt",
      body:
        "Receipt for your ChatGPT Plus subscription. Amount paid USD 20.00. Your subscription renews on June 24, 2026.",
    }),
    message({
      id: "acme-1",
      from: "Billing <billing@acmecloud.io>",
      subject: "Invoice from Acme Cloud",
      body:
        "Monthly subscription plan Pro. Amount due USD 12.00. Next billing date June 24, 2026.",
    }),
    message({
      id: "acme-2",
      from: "Billing <billing@acmecloud.io>",
      subject: "Invoice from Acme Cloud",
      body:
        "Monthly subscription plan Pro. Amount due USD 12.00. Next billing date May 24, 2026.",
    }),
    message({
      id: "temu-promo",
      from: "Temu Offers <promo@temu.com>",
      subject: "Oferta limitada con descuento",
      body:
        "Gana cupones y regalos. Compra hoy por $ 67.990 con envio gratis. No es factura ni suscripción.",
    }),
    message({
      id: "meli-order",
      from: "MercadoLibre <ofertas@mercadolibre.com>",
      subject: "Tu pedido fue pagado",
      body:
        "Compra confirmada. Pedido enviado con tracking. Total pagado $ 89.900. Producto en camino.",
    }),
    message({
      id: "x-suspended",
      from: "X <notify@x.com>",
      subject: "Your X account has been suspended",
      body:
        "Your account has been suspended for violating our rules. Case 865. You can appeal this decision from your account settings.",
    }),
    message({
      id: "security-alert",
      from: "Security <notify@example.com>",
      subject: "Alerta de seguridad de tu cuenta",
      body:
        "Detectamos un intento de inicio de sesión. Código 67990. Verifica tu cuenta si no reconoces esta actividad.",
    }),
    message({
      id: "google-account-setup",
      from: "Google <no-reply@google.com>",
      subject: "Termina de configurar tu nueva Cuenta de Google en tu POCO X7 Pro",
      body:
        "Completa la configuración de tu cuenta de Google en tu nuevo celular. Revisa Gmail, sincroniza contactos y protege tu cuenta. Código del dispositivo 202.",
    }),
    message({
      id: "office-free-access",
      from: "utpinforma@utp.edu.co",
      subject: "Información sobre el acceso a Microsoft Office 365 gratuito",
      body:
        "La universidad informa cómo acceder a Microsoft Office 365 gratuito para estudiantes y docentes. No corresponde a factura ni cobro.",
    }),
    message({
      id: "clickup-discount",
      from: "ClickUp Team <team@mail.clickup.com>",
      subject: "Biggest. Savings. Ever. 35% off ClickUp's Unlimited Plan",
      body:
        "Oferta por tiempo limitado: obtén 35% off en ClickUp Unlimited Plan. Promoción informativa, sin factura ni pago realizado.",
    }),
    message({
      id: "spotify-gift",
      from: "Spotify <no-reply@spotify.com>",
      subject: "Regálale a un amigo 3 meses de Premium. Invitamos nosotros.",
      body:
        "Comparte Premium con tus amigos. Promoción de regalo por tiempo limitado, sin cobro ni renovación.",
    }),
    message({
      id: "master-program",
      from: "maestriaenhistoria@utp.edu.co",
      subject: "¡Inscripciones Maestría en Historia! 2026-2 | Financiación ICETEX y FAC",
      body:
        "Inscripciones abiertas para el programa académico. Valor de matrícula 437700. Consulta financiación y requisitos.",
    }),
  ],
  "gmail-detected",
);

const names = detected.map((item) => item.name);
assert.ok(names.includes("Movistar"), "detects Movistar bill");
assert.ok(names.includes("ChatGPT"), "detects ChatGPT receipt");
assert.ok(names.includes("Acme Cloud"), "detects unknown recurring provider");
assert.ok(!names.some((name) => /temu/i.test(name)), "rejects Temu promo");
assert.ok(!names.some((name) => /mercado/i.test(name)), "rejects MercadoLibre one-time order");
assert.ok(!names.includes("X"), "rejects account suspension notices without billing evidence");
assert.ok(
  !names.some((name) => /security|example/i.test(name)),
  "rejects security notices with numeric codes",
);
assert.ok(!names.includes("Google"), "rejects Google account setup notices");
assert.ok(!names.includes("Microsoft 365"), "rejects free Office 365 access notices");
assert.ok(!names.some((name) => /clickup|mail/i.test(name)), "rejects discount-only SaaS marketing");
assert.ok(!names.includes("Spotify"), "rejects Spotify gift/referral promotions");
assert.ok(!names.some((name) => /utp|historia/i.test(name)), "rejects school enrollment notices");
assert.ok(
  !names.some((name) => /de otra forma|atenci|app store|mercanc|recibir/i.test(name)),
  "rejects legal/footer fragments as provider names",
);

const temuDetected = detectSubscriptionsFromMessages(
  [
    message({
      id: "temu-limited",
      from: "Temu <temu@shop.temuofficial.com>",
      subject: "TIEMPO LIMITADO",
      body:
        "Oferta por tiempo limitado. Este mensaje o de otra forma incluye cupones y regalos. Valor $ 30.755. Compra hoy antes de que expire.",
    }),
    message({
      id: "temu-expiring",
      from: "Temu <temu@shop.temuofficial.com>",
      subject: "Tu oferta está a punto de expirar",
      body:
        "Aprovecha antes de que termine. App Store requisitos del usuario y registro3 si no es necesario. Precio destacado $ 14.018.",
    }),
    message({
      id: "temu-gift",
      from: "Temu <email@market.temuemail.com>",
      subject: "Por favor, confirma tu ¡REGALO!",
      body:
        "Confirma tu regalo. Tienes 96 minutos. Proporcionar las mercancías y aceptar las condiciones de la promoción.",
    }),
    message({
      id: "temu-open-now",
      from: "Temu <email@market.temuemail.com>",
      subject: "Ábrelo AHORA",
      body:
        "Puedes revisar y actualizar o eliminar determinada información de la promoción. Artículos seleccionados desde $ 13.",
    }),
    message({
      id: "temu-zero-items",
      from: "Temu <email@market.temuemail.com>",
      subject: "Por favor, recibe: 8 artículo(s) de $0",
      body:
        "Recibir artículos de $0 es parte de una actividad promocional. No hay factura, cobro recurrente ni renovación.",
    }),
  ],
  "gmail-detected",
);
assert.equal(temuDetected.length, 0, "rejects high-volume Temu marketing campaigns");

const trimitReminderDetected = detectSubscriptionsFromMessages(
  [
    message({
      id: "trimit-reminder",
      from: "Trimit <trimitcol@gmail.com>",
      subject: "Recordatorio de pago - Movistar",
      body:
        "Hola Mayfren, tienes un pago registrado en Trimit para la siguiente suscripción: Movistar. Monto: $ 97.990. Fecha: 26 de junio de 2026. Puedes revisar o actualizar este recordatorio desde tu cuenta. Abrir Trimit. Este correo corresponde a un recordatorio solicitado en Trimit.",
    }),
    message({
      id: "emailjs-reminder",
      from: "Trimit via EmailJS <noreply@emailjs.com>",
      subject: "Recordatorio de pago - Spotify",
      body:
        "Trimit Recordatorio de pago. Tienes un pago registrado en Trimit para la siguiente suscripción: Spotify. Monto: $ 5.100. Abrir Trimit.",
    }),
  ],
  "gmail-detected",
);
assert.equal(trimitReminderDetected.length, 0, "rejects Trimit reminder emails generated by the app");

const movistar = detected.find((item) => item.name === "Movistar");
assert.equal(movistar?.amount, 67990);
assert.equal(movistar?.currency, "COP");
assert.equal(movistar?.nextPaymentDate, "2026-05-26");

const chatgpt = detected.find((item) => item.name === "ChatGPT");
assert.equal(chatgpt?.amount, 20);
assert.equal(chatgpt?.currency, "USD");

const acme = detected.find((item) => item.name === "Acme Cloud");
assert.equal(acme?.amount, 12);
assert.equal(acme?.currency, "USD");
assert.ok((acme?.confidence || 0) >= 68);
