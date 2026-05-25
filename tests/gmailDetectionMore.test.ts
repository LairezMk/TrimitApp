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
    date: new Date(2026, 4, 15),
    ...overrides,
  };
}

const detected = detectSubscriptionsFromMessages(
  [
    message({
      id: "apple",
      from: "Apple <no_reply@email.apple.com>",
      subject: "Your receipt from Apple",
      body: "Apple Music monthly subscription. Total USD 10.99. Renews June 15, 2026.",
    }),
    message({
      id: "google-one",
      from: "Google Payments <payments-noreply@google.com>",
      subject: "Google One payment receipt",
      body: "Your Google One membership was renewed. Amount paid COP 8.900. Next billing date 15 de junio de 2026.",
    }),
    message({
      id: "stripe",
      from: "Stripe Receipts <receipts+acct_123@stripe.com>",
      subject: "Your receipt from Stripe",
      body: "Payment to Notion Labs. Receipt from Notion Labs. Amount paid USD 12.00. Subscription renewal.",
    }),
    message({
      id: "norton-scam",
      from: "Billing Department <billing@secure-renewal.example>",
      subject: "Invoice paid Norton renewal",
      body: "Invoice paid USD 399.99. If you did not authorize this call us now at +1 888 123 4567 for refund.",
    }),
    message({
      id: "cart",
      from: "Shop <news@shop.example>",
      subject: "You left something in your cart",
      body: "Cart reminder. Use coupon and get free shipping. Total $ 59.900.",
    }),
  ],
  "gmail-detected",
);

const names = detected.map((item) => item.name);
assert.ok(names.includes("Apple Music"), `detects Apple Music over generic Apple: ${names.join(", ")}`);
assert.ok(names.includes("Google One"), "detects Google One receipt");
assert.ok(names.includes("Notion"), `extracts merchant from Stripe receipt: ${names.join(", ")}`);
assert.ok(!names.some((name) => /norton/i.test(name)), "rejects invoice scam language");
assert.ok(!names.some((name) => /shop/i.test(name)), "rejects cart reminders");

const googleOne = detected.find((item) => item.name === "Google One");
assert.equal(googleOne?.amount, 8900);
assert.equal(googleOne?.currency, "COP");
assert.equal(googleOne?.nextPaymentDate, "2026-06-15");

const apple = detected.find((item) => item.name === "Apple Music");
assert.equal(apple?.amount, 10.99);
assert.equal(apple?.currency, "USD");
