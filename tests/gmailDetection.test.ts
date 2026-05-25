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
  ],
  "gmail-detected",
);

const names = detected.map((item) => item.name);
assert.ok(names.includes("Movistar"), "detects Movistar bill");
assert.ok(names.includes("ChatGPT"), "detects ChatGPT receipt");
assert.ok(names.includes("Acme Cloud"), "detects unknown recurring provider");
assert.ok(!names.some((name) => /temu/i.test(name)), "rejects Temu promo");
assert.ok(!names.some((name) => /mercado/i.test(name)), "rejects MercadoLibre one-time order");

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
