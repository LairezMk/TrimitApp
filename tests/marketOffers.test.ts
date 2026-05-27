import assert from "node:assert/strict";
import {
  findBestMarketOffer,
  findLocalAlternatives,
  getMarketOfferStats,
  getMarketOffers,
} from "../src/app/services/marketOffers";

const offers = getMarketOffers();

const spotifyFamily = offers.find((offer) => offer.id === "spotify-family-co");
assert.equal(spotifyFamily?.monthlyPrice, 30500);
assert.equal(spotifyFamily?.currency, "COP");
assert.equal(spotifyFamily?.sourceConfidence, "official");

const spotifyIndividual = findBestMarketOffer("Spotify Premium", "Música");
assert.equal(spotifyIndividual?.id, "spotify-individual-co");

const spotifyFamilyMatch = findBestMarketOffer("Spotify Familiar", "Música");
assert.equal(spotifyFamilyMatch?.id, "spotify-family-co");

const netflixPremium = findBestMarketOffer("Netflix Premium", "Entretenimiento");
assert.equal(netflixPremium?.id, "netflix-premium-co");
assert.equal(netflixPremium?.monthlyPrice, 44900);

const entertainmentAlternatives = findLocalAlternatives("Entretenimiento", "Netflix");
assert.ok(
  entertainmentAlternatives.some((offer) => offer.provider === "Amazon Prime"),
  "includes local streaming alternatives",
);
assert.ok(
  entertainmentAlternatives.every((offer) => offer.provider !== "Netflix"),
  "excludes the same provider",
);

const stats = getMarketOfferStats();
assert.ok(stats.colombian >= 15);
assert.ok(stats.official >= 7);
