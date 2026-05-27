import assert from "node:assert/strict";
import { __gmailDetectionTestUtils } from "../src/app/services/gmailDetection";

const { detectSubscriptionsFromMessages } = __gmailDetectionTestUtils;

function message(overrides: {
  id: string;
  from: string;
  subject: string;
  body: string;
  headers?: Record<string, string>;
  snippet?: string;
  date?: Date;
}) {
  return {
    snippet: "",
    date: new Date(2026, 4, 20),
    headers: {},
    labelIds: [],
    ...overrides,
  };
}

const detected = detectSubscriptionsFromMessages(
  [
    message({
      id: "canva-product",
      from: "Canva <product@engage.canva.com>",
      subject: "Novedades de Canva",
      body: "Newsletter semanal con novedades, plantillas y consejos de diseño. Darse de baja.",
      headers: {
        "list-unsubscribe": "<https://engage.canva.com/unsubscribe/abc>",
        "list-unsubscribe-post": "List-Unsubscribe=One-Click",
        "list-id": "canva-product.engage.canva.com",
      },
    }),
    message({
      id: "mercado-libre-offers",
      from: "Mercado Libre <ofertas@r.mercadolibre.com>",
      subject: "Ofertas de la semana",
      body: "Promociones, cupones y descuentos. Darse de baja.",
      headers: {
        "list-unsubscribe": "<mailto:unsubscribe@mercadolibre.com>",
        "list-id": "ofertas.mercadolibre.com",
      },
    }),
    message({
      id: "instant-gaming-newsletter",
      from: "Instant Gaming <newsletter@n.instant-gaming.com>",
      subject: "Nuevos juegos y ofertas",
      body: "Newsletter con novedades, rebajas y ofertas de juegos. Darse de baja.",
      headers: {
        "list-unsubscribe": "<https://n.instant-gaming.com/unsubscribe>",
        "list-id": "instant-gaming-newsletter",
      },
    }),
    message({
      id: "canva-paid",
      from: "Canva <billing@canva.com>",
      subject: "Your Canva Pro invoice",
      body: "Invoice for Canva Pro subscription. Amount paid USD 14.99. Next billing date June 20, 2026.",
      headers: {
        "list-unsubscribe": "<https://canva.com/email/unsubscribe>",
      },
    }),
    message({
      id: "movistar-list",
      from: "Movistar <mail@comunicaciones-movistar.com.co>",
      subject: "Factura Movistar",
      body: "Esta es la factura de tu servicio de internet. Total a pagar $ 67.990. Vencimiento 20 de junio de 2026.",
      headers: {
        "list-unsubscribe": "<https://movistar.com.co/baja>",
      },
    }),
  ],
  "gmail-detected",
);

const names = detected.map((item) => item.name);
assert.ok(names.includes("Canva"), "keeps paid Canva invoice");
assert.ok(names.includes("Movistar"), "keeps paid Movistar bill");
assert.equal(names.filter((name) => name === "Canva").length, 1, "does not duplicate Canva newsletter and invoice");
assert.ok(!names.includes("Mercado Libre"), "rejects Mercado Libre mailing-list offers");
assert.ok(!names.includes("Instant Gaming"), "rejects mailing-list newsletter without paid evidence");

const canva = detected.find((item) => item.name === "Canva");
assert.equal(canva?.amount, 14.99);
assert.equal(canva?.currency, "USD");

const movistar = detected.find((item) => item.name === "Movistar");
assert.equal(movistar?.amount, 67990);
assert.equal(movistar?.currency, "COP");
