export interface MarketOffer {
  id: string;
  provider: string;
  normalizedKeys: string[];
  category: string;
  monthlyPrice: number;
  currency: string;
  billingCycle: "monthly" | "annual";
  planName: string;
  source: string;
  sourceUrl: string;
  notes?: string;
}

const MARKET_OFFERS: MarketOffer[] = [
  {
    id: "netflix-standard-annual",
    provider: "Netflix",
    normalizedKeys: ["netflix"],
    category: "Entretenimiento",
    monthlyPrice: 16.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Standard",
    source: "Netflix",
    sourceUrl: "https://www.netflix.com/",
  },
  {
    id: "spotify-family",
    provider: "Spotify",
    normalizedKeys: ["spotify"],
    category: "Música",
    monthlyPrice: 15.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Family",
    source: "Spotify",
    sourceUrl: "https://www.spotify.com/",
    notes: "Plan familiar, hasta 6 cuentas.",
  },
  {
    id: "disney-basic",
    provider: "Disney+",
    normalizedKeys: ["disney", "disney+"],
    category: "Entretenimiento",
    monthlyPrice: 7.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Basic",
    source: "Disney+",
    sourceUrl: "https://www.disneyplus.com/",
  },
  {
    id: "youtube-premium-student",
    provider: "YouTube Premium",
    normalizedKeys: ["youtube", "youtube premium"],
    category: "Entretenimiento",
    monthlyPrice: 7.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Student",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/premium",
  },
  {
    id: "office-family",
    provider: "Microsoft 365",
    normalizedKeys: ["microsoft 365", "office 365", "microsoft"],
    category: "Productividad",
    monthlyPrice: 9.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Family",
    source: "Microsoft",
    sourceUrl: "https://www.microsoft.com/microsoft-365",
  },
  {
    id: "adobe-photography",
    provider: "Adobe",
    normalizedKeys: ["adobe", "creative cloud", "adobe cc"],
    category: "Productividad",
    monthlyPrice: 19.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Photography",
    source: "Adobe",
    sourceUrl: "https://www.adobe.com/creativecloud/plans.html",
  },
  {
    id: "movistar-basic",
    provider: "Movistar",
    normalizedKeys: ["movistar", "telefonica", "plan datos"],
    category: "Telefonía",
    monthlyPrice: 12,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Plan Datos Base",
    source: "Movistar",
    sourceUrl: "https://www.movistar.com/",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBestMarketOffer(subscriptionName: string, category: string) {
  const normalizedName = normalize(subscriptionName);
  const normalizedCategory = normalize(category);

  const byName = MARKET_OFFERS.filter((offer) =>
    offer.normalizedKeys.some((key) => normalizedName.includes(normalize(key))),
  );

  const candidates = byName.length
    ? byName
    : MARKET_OFFERS.filter(
        (offer) => normalize(offer.category) === normalizedCategory && offer.monthlyPrice > 0,
      );

  if (!candidates.length) {
    return null;
  }

  return candidates.reduce((best, current) =>
    current.monthlyPrice < best.monthlyPrice ? current : best,
  );
}

export function getMarketOffers() {
  return MARKET_OFFERS;
}
