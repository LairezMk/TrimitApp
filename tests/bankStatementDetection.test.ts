import assert from "node:assert/strict";
import { detectSubscriptionsFromBankStatement } from "../src/app/services/bankStatementDetection";

function csvFile(name: string, content: string) {
  return new File([content], name, { type: "text/csv" });
}

const detected = await detectSubscriptionsFromBankStatement(
  csvFile(
    "movimientos.csv",
    [
      "Fecha,Descripcion,Tipo,Monto",
      "05/05/2026,NETFLIX.COM Membresia mensual,Débito,$ 39.900",
      "06/05/2026,SPOTIFY PAGO AUTOMATICO,Débito,$ 18.900",
      "07/05/2026,MERCADOLIBRE COMPRA PRODUCTO,Débito,$ 125.000",
      "08/05/2026,MOVISTAR FACTURA INTERNET BANDA ANCHA,Débito,$ 67.990",
    ].join("\n"),
  ),
);

const names = detected.map((item) => item.name);
assert.ok(names.includes("Netflix"), "detects Netflix in CSV statement");
assert.ok(names.includes("Spotify"), "detects Spotify autopay in CSV statement");
assert.ok(names.includes("Movistar"), "detects telecom bill in CSV statement");
assert.ok(!names.includes("MercadoLibre"), "does not invent MercadoLibre subscription");

const movistar = detected.find((item) => item.name === "Movistar");
assert.equal(movistar?.amount, 67990);
assert.equal(movistar?.currency, "COP");

const netflix = detected.find((item) => item.name === "Netflix");
assert.ok((netflix?.confidence || 0) >= 80);
