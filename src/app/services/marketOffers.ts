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
  country: "CO" | "GLOBAL";
  sourceUpdatedAt: string;
  sourceConfidence: "official" | "market-reference" | "estimated";
  seats?: number;
  annualPrice?: number;
  features?: string[];
  notes?: string;
}

const MARKET_OFFERS: MarketOffer[] = [
  {
    id: "spotify-individual-co",
    provider: "Spotify",
    normalizedKeys: ["spotify", "spotify premium", "premium individual"],
    category: "Música",
    monthlyPrice: 18500,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Premium Individual",
    source: "Spotify Colombia",
    sourceUrl: "https://www.spotify.com/co-es/premium/",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 1,
    features: ["Sin anuncios", "Música offline", "Cuenta individual"],
  },
  {
    id: "spotify-duo-co",
    provider: "Spotify",
    normalizedKeys: ["spotify", "spotify duo", "premium duo"],
    category: "Música",
    monthlyPrice: 24500,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Premium Duo",
    source: "Spotify Colombia",
    sourceUrl: "https://www.spotify.com/co-es/premium/",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 2,
    features: ["2 cuentas Premium", "Para personas que conviven"],
  },
  {
    id: "spotify-family-co",
    provider: "Spotify",
    normalizedKeys: ["spotify", "spotify familiar", "spotify family", "premium familiar"],
    category: "Música",
    monthlyPrice: 30500,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Premium Familiar",
    source: "Spotify Colombia",
    sourceUrl: "https://www.spotify.com/co-es/premium/",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 6,
    features: ["Hasta 6 cuentas", "Control parental", "Para el mismo hogar"],
  },
  {
    id: "spotify-student-co",
    provider: "Spotify",
    normalizedKeys: ["spotify", "spotify estudiante", "spotify student", "premium estudiante"],
    category: "Música",
    monthlyPrice: 10100,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Premium Estudiantes",
    source: "Spotify Colombia",
    sourceUrl: "https://www.spotify.com/co-es/premium/",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 1,
    features: ["Requiere verificación estudiantil", "Hasta 4 años"],
  },
  {
    id: "netflix-basic-co",
    provider: "Netflix",
    normalizedKeys: ["netflix", "netflix basico", "netflix básico", "netflix basic"],
    category: "Entretenimiento",
    monthlyPrice: 18900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Básico",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/netflix",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 1,
    features: ["HD 720p", "1 pantalla"],
  },
  {
    id: "netflix-standard-co",
    provider: "Netflix",
    normalizedKeys: ["netflix", "netflix estandar", "netflix estándar", "netflix standard"],
    category: "Entretenimiento",
    monthlyPrice: 29900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Estándar",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/netflix",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 2,
    features: ["Full HD 1080p", "2 pantallas"],
  },
  {
    id: "netflix-premium-co",
    provider: "Netflix",
    normalizedKeys: ["netflix", "netflix premium"],
    category: "Entretenimiento",
    monthlyPrice: 44900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Premium",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/netflix",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 4,
    features: ["4K", "Audio espacial", "4 pantallas"],
  },
  {
    id: "disney-ads-co",
    provider: "Disney+",
    normalizedKeys: ["disney", "disney+", "disney plus", "disney estandar con anuncios"],
    category: "Entretenimiento",
    monthlyPrice: 24900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Estándar con anuncios",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/disney-plus",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 2,
    features: ["Full HD", "ESPN y ESPN3 con anuncios", "2 dispositivos"],
  },
  {
    id: "disney-standard-co",
    provider: "Disney+",
    normalizedKeys: ["disney", "disney+", "disney plus", "disney estandar", "disney estándar"],
    category: "Entretenimiento",
    monthlyPrice: 36900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Estándar",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/disney-plus",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 2,
    features: ["Sin anuncios", "Full HD", "Descargas"],
  },
  {
    id: "disney-premium-co",
    provider: "Disney+",
    normalizedKeys: ["disney", "disney+", "disney plus", "disney premium"],
    category: "Entretenimiento",
    monthlyPrice: 49900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Premium",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/disney-plus",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 4,
    features: ["4K", "Dolby Atmos", "ESPN completo"],
  },
  {
    id: "max-basic-annual-co",
    provider: "Max",
    normalizedKeys: ["max", "hbo", "hbo max", "max basico", "max básico"],
    category: "Entretenimiento",
    monthlyPrice: 11583,
    currency: "COP",
    billingCycle: "annual",
    planName: "Básico anual",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/hbo-max",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 2,
    annualPrice: 139000,
    features: ["Con anuncios", "Precio mensual equivalente", "2 dispositivos"],
  },
  {
    id: "max-standard-co",
    provider: "Max",
    normalizedKeys: ["max", "hbo", "hbo max", "max estandar", "max estándar"],
    category: "Entretenimiento",
    monthlyPrice: 23900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Estándar",
    source: "Selectra Colombia",
    sourceUrl: "https://selectra.com.co/streaming/hbo-max",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "market-reference",
    seats: 2,
    features: ["Sin anuncios", "Full HD", "Descargas"],
  },
  {
    id: "prime-annual-co",
    provider: "Amazon Prime",
    normalizedKeys: ["amazon", "amazon prime", "prime video", "prime"],
    category: "Entretenimiento",
    monthlyPrice: 13800,
    currency: "COP",
    billingCycle: "annual",
    planName: "Prime anual",
    source: "Amazon",
    sourceUrl: "https://press.aboutamazon.com/company-news/2025/5/amazon-prime-launches-in-colombia-free-and-fast-international-delivery-prime-video-exclusive-deals-and-prime-day-prime-gaming-and-more",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 3,
    annualPrice: 165600,
    features: ["Precio equivalente mensual", "Prime Video", "Envíos Prime", "Prime Gaming"],
  },
  {
    id: "prime-monthly-co",
    provider: "Amazon Prime",
    normalizedKeys: ["amazon", "amazon prime", "prime video", "prime"],
    category: "Entretenimiento",
    monthlyPrice: 24900,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Prime mensual",
    source: "Amazon",
    sourceUrl: "https://press.aboutamazon.com/company-news/2025/5/amazon-prime-launches-in-colombia-free-and-fast-international-delivery-prime-video-exclusive-deals-and-prime-day-prime-gaming-and-more",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 3,
    features: ["Prime Video", "Envíos Prime", "Prime Gaming"],
  },
  {
    id: "microsoft-365-personal-co",
    provider: "Microsoft 365",
    normalizedKeys: ["microsoft 365", "office 365", "microsoft", "office", "microsoft personal"],
    category: "Productividad",
    monthlyPrice: 36999,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Personal",
    source: "Microsoft Store Colombia",
    sourceUrl: "https://www.microsoft.com/es-co/microsoft-365/buy/compare-all-microsoft-365-products",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 1,
    features: ["1 TB", "Apps Office", "Copilot"],
  },
  {
    id: "microsoft-365-family-annual-co",
    provider: "Microsoft 365",
    normalizedKeys: ["microsoft 365", "office 365", "microsoft", "office", "microsoft family", "microsoft familia"],
    category: "Productividad",
    monthlyPrice: 38333,
    currency: "COP",
    billingCycle: "annual",
    planName: "Familia anual",
    source: "Microsoft Store Colombia",
    sourceUrl: "https://www.microsoft.com/es-co/microsoft-365/buy/compare-all-microsoft-365-products",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 6,
    annualPrice: 459999,
    features: ["Precio equivalente mensual", "Hasta 6 personas", "Hasta 6 TB"],
  },
  {
    id: "microsoft-365-family-co",
    provider: "Microsoft 365",
    normalizedKeys: ["microsoft 365", "office 365", "microsoft", "office", "microsoft family", "microsoft familia"],
    category: "Productividad",
    monthlyPrice: 45999,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Familia mensual",
    source: "Microsoft Store Colombia",
    sourceUrl: "https://www.microsoft.com/es-co/microsoft-365/buy/compare-all-microsoft-365-products",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 6,
    features: ["Hasta 6 personas", "Hasta 6 TB", "Apps Office"],
  },
  {
    id: "adobe-photography-co",
    provider: "Adobe",
    normalizedKeys: ["adobe", "creative cloud", "adobe cc", "photoshop", "lightroom", "fotografia", "fotografía"],
    category: "Productividad",
    monthlyPrice: 39151,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Fotografía",
    source: "Adobe Colombia",
    sourceUrl: "https://www.adobe.com/co/creativecloud/plans.html",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 1,
    features: ["Photoshop", "Lightroom", "1 TB"],
  },
  {
    id: "adobe-photoshop-co",
    provider: "Adobe",
    normalizedKeys: ["adobe", "photoshop"],
    category: "Productividad",
    monthlyPrice: 45030,
    currency: "COP",
    billingCycle: "monthly",
    planName: "Photoshop",
    source: "Adobe Colombia",
    sourceUrl: "https://www.adobe.com/co/creativecloud/plans.html",
    country: "CO",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "official",
    seats: 1,
    features: ["Photoshop", "Plan anual con pago mensual"],
  },
  {
    id: "youtube-premium-individual-usd-co",
    provider: "YouTube Premium",
    normalizedKeys: ["youtube", "youtube premium"],
    category: "Entretenimiento",
    monthlyPrice: 13.99,
    currency: "USD",
    billingCycle: "monthly",
    planName: "Individual",
    source: "Referencia de pago USD para Colombia",
    sourceUrl: "https://spendfigo.com/guides/youtube-premium/colombia",
    country: "GLOBAL",
    sourceUpdatedAt: "2026-05-27",
    sourceConfidence: "estimated",
    seats: 1,
    notes: "YouTube puede mostrar precios distintos según cuenta, país de facturación y tienda de app.",
    features: ["Sin anuncios", "YouTube Music incluido", "Precio referencial en USD"],
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

  const byName = MARKET_OFFERS.filter((offer) =>
    offer.normalizedKeys.some((key) => normalizedName.includes(normalize(key))),
  );

  if (!byName.length) {
    return null;
  }

  const planMatched = byName.filter((offer) => {
    const normalizedPlan = normalize(offer.planName);
    if (/familiar|family|familia/.test(normalizedName)) {
      return /familiar|family|familia/.test(normalizedPlan);
    }
    if (/\bduo\b/.test(normalizedName)) {
      return /\bduo\b/.test(normalizedPlan);
    }
    if (/estudiante|student/.test(normalizedName)) {
      return /estudiante|student/.test(normalizedPlan);
    }
    if (/premium|platino|4k|pro/.test(normalizedName)) {
      return (
        /premium|platino|pro|fotografia|fotografía/.test(normalizedPlan) &&
        !/estudiante|student/.test(normalizedPlan)
      );
    }
    if (/estandar|estándar|standard/.test(normalizedName)) {
      return /estandar|estándar|standard/.test(normalizedPlan);
    }
    return !/estudiante|student/.test(normalizedPlan);
  });

  const candidates = planMatched.length ? planMatched : byName;

  return candidates.reduce((best, current) =>
    current.monthlyPrice < best.monthlyPrice ? current : best,
  );
}

export function findLocalAlternatives(category: string, excludeProvider?: string) {
  const normalizedCategory = normalize(category);
  const normalizedProvider = normalize(excludeProvider || "");

  return MARKET_OFFERS.filter((offer) => {
    const sameCategory = normalize(offer.category) === normalizedCategory;
    const sameProvider = normalizedProvider && normalize(offer.provider) === normalizedProvider;
    return sameCategory && !sameProvider && offer.monthlyPrice > 0;
  }).sort((a, b) => a.monthlyPrice - b.monthlyPrice);
}

export function getMarketOfferStats() {
  const colombianOffers = MARKET_OFFERS.filter((offer) => offer.country === "CO");
  const officialOffers = MARKET_OFFERS.filter((offer) => offer.sourceConfidence === "official");
  const lastUpdatedAt = MARKET_OFFERS.map((offer) => offer.sourceUpdatedAt).sort().at(-1);

  return {
    total: MARKET_OFFERS.length,
    colombian: colombianOffers.length,
    official: officialOffers.length,
    lastUpdatedAt: lastUpdatedAt || "",
  };
}

export function getMarketOffers() {
  return MARKET_OFFERS;
}
