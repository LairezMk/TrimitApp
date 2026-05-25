import assert from "node:assert/strict";
import { normalizeSubscriptionIdentity } from "../src/app/utils/subscriptionIdentity";

assert.equal(normalizeSubscriptionIdentity("Netflix Colombia S.A.S."), "netflix");
assert.equal(normalizeSubscriptionIdentity("MOVISTAR COLOMBIA"), "movistar");
assert.equal(normalizeSubscriptionIdentity("YouTube   Premium"), "youtube premium");
assert.equal(normalizeSubscriptionIdentity("HBO Max LATAM"), "hbo max");

const sameService = new Set([
  normalizeSubscriptionIdentity("Spotify"),
  normalizeSubscriptionIdentity("Spotify Colombia SAS"),
  normalizeSubscriptionIdentity("SPOTIFY S.A."),
]);

assert.equal(sameService.size, 1, "normalizes common legal suffixes for dedupe");
