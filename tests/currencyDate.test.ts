import assert from "node:assert/strict";
import {
  formatAmountInput,
  parseAmountInput,
} from "../src/app/utils/currency";
import { dateFromInputValue, dateToInputValue } from "../src/app/utils/date";

assert.equal(parseAmountInput("35000", "COP"), 35000);
assert.equal(parseAmountInput("35.000", "COP"), 35000);
assert.equal(parseAmountInput("67.990", "COP"), 67990);
assert.equal(parseAmountInput("COP 67.990", "COP"), 67990);
assert.equal(parseAmountInput("9.99", "USD"), 9.99);
assert.equal(parseAmountInput("9,99", "EUR"), 9.99);
assert.equal(formatAmountInput(35000, "COP"), "35.000");

const localDate = dateFromInputValue("2026-05-31");
assert.equal(localDate.getFullYear(), 2026);
assert.equal(localDate.getMonth(), 4);
assert.equal(localDate.getDate(), 31);
assert.equal(dateToInputValue(localDate), "2026-05-31");
