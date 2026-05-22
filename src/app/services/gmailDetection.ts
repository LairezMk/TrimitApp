const SESSION_KEY = "trimit.gmail.detectedSubscriptions";

interface ProviderHint {
  name: string;
  category: string;
  icon: string;
  color: string;
  patterns: RegExp[];
}

const PROVIDER_HINTS: ProviderHint[] = [
  {
    name: "Netflix",
    category: "Entretenimiento",
    icon: "N",
    color: "bg-red-500",
    patterns: [/netflix/i, /netflix\.com/i, /netflix\s*,?\s*inc/i],
  },
  {
    name: "Spotify",
    category: "Música",
    icon: "S",
    color: "bg-emerald-500",
    patterns: [/spotify/i],
  },
  {
    name: "Disney+",
    category: "Entretenimiento",
    icon: "D",
    color: "bg-blue-500",
    patterns: [/disney\+/i, /disneyplus/i],
  },
  {
    name: "YouTube Premium",
    category: "Entretenimiento",
    icon: "Y",
    color: "bg-red-500",
    patterns: [/youtube premium/i, /youtube memberships?/i],
  },
  {
    name: "Amazon Prime",
    category: "Entretenimiento",
    icon: "A",
    color: "bg-cyan-500",
    patterns: [/amazon prime/i, /prime video/i],
  },
  {
    name: "Max",
    category: "Entretenimiento",
    icon: "M",
    color: "bg-indigo-500",
    patterns: [/hbomax/i, /hbo\s*max/i, /max\.com/i, /stream\s*max/i],
  },
  {
    name: "Apple",
    category: "Productividad",
    icon: "A",
    color: "bg-gray-700",
    patterns: [/apple\.com/i, /icloud/i, /apple\s+one/i],
  },
  {
    name: "Google One",
    category: "Productividad",
    icon: "G",
    color: "bg-blue-500",
    patterns: [/google\s+one/i, /google\s+storage/i, /google\s+play/i],
  },
  {
    name: "Adobe",
    category: "Productividad",
    icon: "A",
    color: "bg-red-500",
    patterns: [/adobe/i, /creative cloud/i],
  },
  {
    name: "Canva",
    category: "Productividad",
    icon: "C",
    color: "bg-purple-500",
    patterns: [/canva/i],
  },
  {
    name: "Dropbox",
    category: "Productividad",
    icon: "D",
    color: "bg-blue-600",
    patterns: [/dropbox/i],
  },
  {
    name: "Notion",
    category: "Productividad",
    icon: "N",
    color: "bg-gray-800",
    patterns: [/notion/i],
  },
  {
    name: "ChatGPT",
    category: "Productividad",
    icon: "C",
    color: "bg-emerald-600",
    patterns: [/chatgpt/i, /openai/i],
  },
  {
    name: "GitHub",
    category: "Productividad",
    icon: "G",
    color: "bg-gray-800",
    patterns: [/github/i],
  },
  {
    name: "Figma",
    category: "Productividad",
    icon: "F",
    color: "bg-pink-500",
    patterns: [/figma/i],
  },
  {
    name: "Slack",
    category: "Productividad",
    icon: "S",
    color: "bg-purple-500",
    patterns: [/slack/i],
  },
  {
    name: "Zoom",
    category: "Productividad",
    icon: "Z",
    color: "bg-blue-500",
    patterns: [/\bzoom\b/i, /zoom\.us/i],
  },
  {
    name: "Duolingo",
    category: "Educación",
    icon: "D",
    color: "bg-green-500",
    patterns: [/duolingo/i],
  },
  {
    name: "Coursera",
    category: "Educación",
    icon: "C",
    color: "bg-blue-600",
    patterns: [/coursera/i],
  },
  {
    name: "Uber One",
    category: "Transporte",
    icon: "U",
    color: "bg-gray-900",
    patterns: [/uber\s+one/i],
  },
  {
    name: "Rappi Pro",
    category: "Compras",
    icon: "R",
    color: "bg-orange-500",
    patterns: [/rappi\s*pro/i, /rappi\s*prime/i],
  },
  {
    name: "iCloud+",
    category: "Productividad",
    icon: "I",
    color: "bg-blue-400",
    patterns: [/icloud\+/i, /icloud\s+storage/i],
  },
  {
    name: "Microsoft 365",
    category: "Productividad",
    icon: "M",
    color: "bg-blue-500",
    patterns: [/microsoft 365/i, /office 365/i],
  },
  {
    name: "Movistar",
    category: "Telefonía",
    icon: "M",
    color: "bg-cyan-500",
    patterns: [/movistar/i],
  },
  {
    name: "Claro",
    category: "Telefonía",
    icon: "C",
    color: "bg-red-500",
    patterns: [/claro/i],
  },
  {
    name: "Tigo",
    category: "Telefonía",
    icon: "T",
    color: "bg-blue-500",
    patterns: [/tigo/i],
  },
  {
    name: "WOM",
    category: "Telefonía",
    icon: "W",
    color: "bg-purple-500",
    patterns: [/\bwom\b/i],
  },
  {
    name: "Plan de datos",
    category: "Telefonía",
    icon: "P",
    color: "bg-emerald-500",
    patterns: [/plan de datos/i, /\bdatos móviles\b/i, /\bpaquete de datos\b/i],
  },
];

export interface DetectedSubscriptionDraft {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  nextPaymentDate: string;
  isRecurring: boolean;
  icon: string;
  color: string;
  source: "gmail-detected" | "email-detected" | "bank-statement";
  confidence: number;
  from: string;
  subject: string;
}

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  date?: Date | null;
}

interface GmailMessageListResponse {
  messages?: Array<{ id: string }>;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailMessagePart[];
  headers?: GmailHeader[];
}

interface GmailMessageResponse {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
}

function toBase64(input: string) {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  }
  return input;
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(
      Array.prototype.map
        .call(window.atob(padded), (char: string) =>
          `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`,
        )
        .join(""),
    );
  }

  return padded;
}

function collectBodyText(part?: GmailMessagePart): string[] {
  if (!part) {
    return [];
  }

  const texts: string[] = [];
  if (
    (part.mimeType === "text/plain" || part.mimeType === "text/html") &&
    part.body?.data
  ) {
    texts.push(decodeBase64Url(part.body.data));
  }

  if (part.parts?.length) {
    for (const child of part.parts) {
      texts.push(...collectBodyText(child));
    }
  }

  return texts;
}

function inferCurrency(fragment: string) {
  const normalized = fragment.toLowerCase();
  if (
    normalized.includes("cop") ||
    normalized.includes("col$") ||
    normalized.includes("co$") ||
    normalized.includes("pesos") ||
    normalized.includes("colombia") ||
    normalized.includes("pago pse")
  ) {
    return "COP";
  }
  if (normalized.includes("eur") || normalized.includes("€")) {
    return "EUR";
  }
  if (normalized.includes("usd")) {
    return "USD";
  }
  if (normalized.includes("us$")) {
    return "USD";
  }
  return "$";
}

function normalizeAmount(raw: string, currencyHint: string) {
  const cleaned = raw.replace(/[^\d,.\s]/g, "").replace(/\s/g, "");
  if (!cleaned) {
    return null;
  }

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  const digitsOnly = cleaned.replace(/[.,]/g, "");

  if (!digitsOnly || digitsOnly.length > 10) {
    return null;
  }

  if (!hasComma && !hasDot) {
    const plain = Number(digitsOnly);
    return Number.isFinite(plain) ? plain : null;
  }

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    const decimalSep = lastComma > lastDot ? "," : ".";
    const thousandSep = decimalSep === "," ? "." : ",";
    const decimalChunks = cleaned.split(decimalSep);
    const fractional = decimalChunks[decimalChunks.length - 1] || "";

    if (fractional.length <= 2) {
      const normalized = cleaned.split(thousandSep).join("").replace(decimalSep, ".");
      const value = Number(normalized);
      return Number.isFinite(value) ? value : null;
    }

    const grouped = Number(cleaned.replace(/[.,]/g, ""));
    return Number.isFinite(grouped) ? grouped : null;
  }

  const sep = hasComma ? "," : ".";
  const chunks = cleaned.split(sep);
  const fractional = chunks[chunks.length - 1] || "";

  if (chunks.length > 2) {
    const grouped = Number(cleaned.replace(/[.,]/g, ""));
    return Number.isFinite(grouped) ? grouped : null;
  }

  if (currencyHint === "COP" && fractional.length === 3) {
    const grouped = Number(cleaned.replace(/[.,]/g, ""));
    return Number.isFinite(grouped) ? grouped : null;
  }

  if (fractional.length === 2) {
    const decimal = Number(cleaned.replace(sep, "."));
    return Number.isFinite(decimal) ? decimal : null;
  }

  if (fractional.length === 3) {
    const grouped = Number(cleaned.replace(/[.,]/g, ""));
    return Number.isFinite(grouped) ? grouped : null;
  }

  const fallback = Number(cleaned.replace(/[.,]/g, ""));
  return Number.isFinite(fallback) ? fallback : null;
}

interface AmountCandidate {
  amount: number;
  currency: string;
  score: number;
}

function extractAmount(text: string) {
  const amountPatterns = [
    /(?:cop|col\$|co\$|us\$|pesos?|usd|eur|[$€])\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{4,8})/gi,
    /([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{4,8})\s*(?:cop|col\$|co\$|us\$|pesos?|usd|eur)\b/gi,
    /(total\s*(?:a\s*pagar|paid|due|pago)?|valor\s*(?:a\s*pagar)?|importe|monto|factura|invoice|amount\s*(?:paid|due)?|subtotal|charged|cargo|vencimiento|renovaci[oó]n)\D{0,34}([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{4,8})/gi,
    /(plan|membres[ií]a|membership|suscripci[oó]n|subscription|mensualidad|renovaci[oó]n|renewal|billing\s*period)\D{0,34}([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{1,2})?|[0-9]{4,8})/gi,
  ];
  const scoringKeywords =
    /total\s*a\s*pagar|total\s*paid|amount\s*paid|amount\s*due|valor\s*a\s*pagar|importe\s*a\s*pagar|saldo\s*a\s*pagar|monto|factura|invoice|recibo|receipt|vencimiento|plan|membres[ií]a|membership|suscripci[oó]n|subscription|renovaci[oó]n|renewal|mensualidad|billing\s*period/i;
  const candidates: AmountCandidate[] = [];

  for (const pattern of amountPatterns) {
    let match = pattern.exec(text);
    while (match) {
      const rawAmount = (match[2] || match[1] || "").trim();
      const matchText = match[0] || "";
      const currency = inferCurrency(matchText);
      const amount = normalizeAmount(rawAmount, currency);
      const start = Math.max(0, (match.index || 0) - 80);
      const end = Math.min(text.length, (match.index || 0) + matchText.length + 80);
      const context = text.slice(start, end);

      if (amount && amount > 0) {
        let score = 40;

        if (scoringKeywords.test(context)) {
          score += 30;
        }
        if (/(cop|col\$|pesos?|[$€]|usd|eur)/i.test(matchText)) {
          score += 20;
        }
        if (amount >= 1000 && amount <= 5_000_000) {
          score += 15;
        }
        if (currency === "COP" && amount < 1000) {
          score -= 20;
        }
        if (/^\d{7,}$/.test(rawAmount.replace(/[.,]/g, ""))) {
          score -= 20;
        }

        candidates.push({ amount, currency, score });
      }

      match = pattern.exec(text);
    }
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => b.score - a.score || b.amount - a.amount);
  const best = candidates[0];
  return { amount: best.amount, currency: best.currency };
}

function parseSpanishDate(monthName: string, day: number, year?: number) {
  const months: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    setiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  const month = months[monthName.toLowerCase()];
  if (month === undefined) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const parsed = new Date(year || currentYear, month, day);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function extractDate(text: string) {
  const isoMatch = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) {
    const parsed = new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
    );
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const latamMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if (latamMatch) {
    const parsed = new Date(
      Number(latamMatch[3]),
      Number(latamMatch[2]) - 1,
      Number(latamMatch[1]),
    );
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const spanishMatch = text.match(
    /\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(20\d{2}))?\b/i,
  );
  if (spanishMatch) {
    const parsed = parseSpanishDate(
      spanishMatch[2],
      Number(spanishMatch[1]),
      spanishMatch[3] ? Number(spanishMatch[3]) : undefined,
    );
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function ensureFutureDate(date: Date) {
  const now = new Date();
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (normalized >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return normalized;
  }

  const bumped = new Date(normalized);
  bumped.setMonth(bumped.getMonth() + 1);
  return bumped;
}

function addDefaultNextPaymentDate() {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next;
}

function addDefaultNextPaymentByCadence(cadenceDays: number) {
  const next = new Date();
  next.setDate(next.getDate() + cadenceDays);
  return next;
}

function findProvider(text: string) {
  for (const hint of PROVIDER_HINTS) {
    if (hint.patterns.some((pattern) => pattern.test(text))) {
      return hint;
    }
  }

  const namedEnMatch = text.match(
    /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,)?\s+(20\d{2})\b/i,
  );
  if (namedEnMatch) {
    const months: Record<string, number> = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };
    const monthText = namedEnMatch[0].split(/\s+/)[0].toLowerCase().replace(",", "");
    const parsed = new Date(
      Number(namedEnMatch[2]),
      months[monthText],
      Number(namedEnMatch[1]),
    );
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

function findProviderForMessage(from: string, text: string) {
  const senderProvider = findProvider(from);
  if (senderProvider) {
    return senderProvider;
  }

  return findProvider(text);
}

function extractHeader(headers: GmailHeader[] | undefined, name: string) {
  return headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())
    ?.value;
}

function extractCadenceDays(text: string) {
  const normalized = text.toLowerCase();

  if (
    /\bcada\s*15\s*d[ií]as\b/.test(normalized) ||
    /\bquincenal\b/.test(normalized) ||
    /\bcada\s*quince\b/.test(normalized)
  ) {
    return 15;
  }

  if (
    /\bcada\s*(30|treinta)\s*d[ií]as\b/.test(normalized) ||
    /\bmensual\b/.test(normalized) ||
    /\bmensualidad\b/.test(normalized) ||
    /\bcada\s*mes\b/.test(normalized) ||
    /\bmonthly\b/.test(normalized) ||
    /\bper\s*month\b/.test(normalized) ||
    /\bbilling\s*period\b/.test(normalized) ||
    /\bnext\s*billing\s*date\b/.test(normalized) ||
    /\brenovaci[oó]n\s*autom[aá]tica\b/.test(normalized) ||
    /\bauto(?:matic)?\s*renewal\b/.test(normalized) ||
    /\bd[eé]bito\s*autom[aá]tico\b/.test(normalized) ||
    /\bcargo\s*recurrente\b/.test(normalized)
  ) {
    return 30;
  }

  if (
    /\banual\b/.test(normalized) ||
    /\bcada\s*a[nñ]o\b/.test(normalized) ||
    /\bannual\b/.test(normalized) ||
    /\byearly\b/.test(normalized)
  ) {
    return 365;
  }

  return null;
}

function isLikelyRecurring(text: string) {
  const cadence = extractCadenceDays(text);
  if (cadence) {
    return true;
  }

  const normalized = text.toLowerCase();
  return (
    /\b(plan|membres[ií]a|membership|suscripci[oó]n|subscription)\b/i.test(normalized) ||
    /\b(mensual|monthly|per\s*month|cada\s*mes)\b/i.test(normalized) ||
    /\b(renovaci[oó]n|renovada|renovado|renewal|renewed|renovation|recurrente|recurring|auto(?:matic)?\s*renewal|d[eé]bito\s*autom[aá]tico|billing\s*period|next\s*billing\s*date)\b/i.test(
      normalized,
    )
  );
}

function isLikelyReceipt(text: string) {
  const normalized = text.toLowerCase();
  return /\b(pago\s*realizado|pago\s*confirmado|pago\s*exitoso|pago\s*aprobado|pago\s*recibido|payment\s*(successful|confirmed|approved|received)|paid\s*invoice|invoice\s*(paid|payment|summary)?|receipt|recibo\s*(de\s*pago)?|factura\s*(electr[oó]nica)?|comprobante\s*de\s*pago|cobro\s*realizado|cargo\s*realizado|se\s*(cobro|cargo)|transacci[oó]n\s*aprobada|tu\s*orden\s*ha\s*sido\s*pagada|order\s*paid|debitado|d[eé]bito\s*autom[aá]tico|se\s*debito|charged|charge\s*was\s*made|your\s*(subscription|membership)\s*(renewed|was\s*renewed)|renovaci[oó]n\s*(confirmada|realizada)|suscripci[oó]n\s*renovada)\b/i.test(
    normalized,
  );
}

function isLikelyPromotional(text: string) {
  const normalized = text.toLowerCase();
  return /\b(oferta|promoci[oó]n|descuento|cup[oó]n|cupon|regalo|gratis|obsequio|gana|ganaste|sorteo|puntos|cashback|bono|recompensa|beneficio|invita|referid[oa]|te\s*aceptaron|bienvenido\s+a|welcome\s*gift|free|gift|eligible|3\s*meses\s*por\s*\$?0|meses\s*gratis|black\s*friday|hot\s*sale|cyber\s*monday)\b/i.test(
    normalized,
  );
}

function isLikelyPromotionalSender(from: string) {
  const normalized = from.toLowerCase();
  return /\b(temu|marketing|newsletter|news|promo|promos|offers|deal|deals|ofertas|noreply\.news|no-reply\.news)\b/.test(
    normalized,
  );
}

function isBlockedCommerceSender(from: string) {
  const normalized = from.toLowerCase();
  return /\b(temu|shein|aliexpress|mercadolibre|mercado\s*libre)\b/.test(
    normalized,
  );
}

function isLikelyOneTimeCommerce(text: string) {
  const normalized = text.toLowerCase();
  return /\b(pedido|orden|compra|carrito|env[ií]o|entrega|tracking|gu[ií]a|producto|seller|vendedor|order\s*(confirmation|shipped)|your\s*order|purchase|shipping|delivered)\b/i.test(
    normalized,
  );
}

function hasPaymentContext(text: string) {
  const normalized = text.toLowerCase();
  return /\b(pago|pagado|pagaste|cobro|cargo|factura|recibo|comprobante|transacci[oó]n|invoice|receipt|payment|paid|billing|charged|charge|debitado|d[eé]bito)\b/i.test(
    normalized,
  );
}

function isLikelyInvoiceScam(text: string) {
  const normalized = text.toLowerCase();
  const hasPhone = /(?:\+?\d[\s().-]?){8,}/.test(normalized);
  const scareLanguage =
    /\b(if\s*you\s*did\s*not\s*authorize|si\s*no\s*reconoces|unauthorized|fraudulent|refund|reembolso|call\s*(us|now)|llama\s*(ahora|al)|customer\s*support\s*number|norton|mcafee|geek\s*squad)\b/i.test(
      normalized,
    );

  return hasPhone && scareLanguage;
}

function extractEmailDomain(from: string) {
  const emailMatch = from.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);
  return emailMatch?.[1]?.toLowerCase() || "";
}

function isPaymentProcessorSender(from: string) {
  const domain = extractEmailDomain(from);
  return (
    domain.includes("stripe.com") ||
    domain.includes("paypal.com") ||
    domain.includes("paddle.com") ||
    domain.includes("xsolla.com") ||
    domain.includes("mercadopago") ||
    domain.includes("wompi") ||
    domain.includes("payu")
  );
}

function parseSenderName(from: string) {
  const clean = from.replace(/["<>]/g, " ").trim();
  const domain = extractEmailDomain(clean);

  if (domain.includes("movistar")) {
    return "Movistar";
  }
  if (domain.includes("claro")) {
    return "Claro";
  }
  if (domain.includes("tigo")) {
    return "Tigo";
  }
  if (domain.includes("wom")) {
    return "WOM";
  }
  if (domain.includes("netflix")) {
    return "Netflix";
  }
  if (domain.includes("spotify")) {
    return "Spotify";
  }
  if (domain.includes("microsoft")) {
    return "Microsoft 365";
  }
  if (domain.includes("apple")) {
    return "Apple";
  }
  if (domain.includes("stripe")) {
    return "Stripe";
  }
  if (domain.includes("paypal")) {
    return "PayPal";
  }

  const named = clean.split("<")[0].trim();
  if (named && named.length > 2 && !named.includes("@")) {
    return named.slice(0, 40);
  }

  if (domain) {
    const root = domain.split(".")[0];
    return root.charAt(0).toUpperCase() + root.slice(1);
  }

  return "Suscripción detectada";
}

function fallbackCategory(text: string) {
  const normalized = text.toLowerCase();
  if (/movistar|claro|tigo|wom|plan de datos|telefon/i.test(normalized)) {
    return "Telefonía";
  }
  if (/internet|fibra|wifi/.test(normalized)) {
    return "Internet";
  }
  if (/seguro|insurance/.test(normalized)) {
    return "Seguros";
  }
  return "Otros";
}

function extractProviderName(text: string) {
  const providerMatch = text.match(
    /(proveedor\s+del\s+servicio|proveedor|merchant|comercio|servicio|empresa|business|seller|paid\s*to|payment\s*to|receipt\s*from|invoice\s*from|factura\s*de|recibo\s*de)\s*[:\-]?\s*([A-Za-z0-9&+.,'´`’\-\s]{3,70})/i,
  );

  if (!providerMatch) {
    return null;
  }

  const candidate = providerMatch[2].trim();
  if (!candidate || candidate.length < 3) {
    return null;
  }

  return candidate.replace(/\s{2,}/g, " ").slice(0, 60);
}

function cleanMerchantCandidate(candidate: string) {
  return candidate
    .replace(/\s+/g, " ")
    .replace(/\b(inc|llc|ltd|limited|corp|corporation|s\.a\.s|sas|s\.a|ltda)\b\.?/gi, "")
    .replace(/\b(receipt|invoice|factura|recibo|payment|pago|paid|subscription|suscripci[oó]n)\b.*$/i, "")
    .replace(/[|•#].*$/g, "")
    .trim()
    .slice(0, 60);
}

function extractStoreSubscriptionName(text: string) {
  const patterns = [
    /(subscription|membership|suscripci[oó]n|membres[ií]a|item|producto|description|descripci[oó]n)\s*[:\-]\s*([A-Za-z0-9&+.,'´`’\-\s]{3,70})/i,
    /(google\s*play|app\s*store|apple)\D{0,40}(youtube\s*premium|youtube\s*music|google\s*one|icloud\+?|duolingo|canva|spotify|netflix|disney\+|chatgpt|notion|dropbox|microsoft\s*365)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const candidate = match?.[2]?.trim();
    if (candidate) {
      const cleaned = cleanMerchantCandidate(candidate);
      if (cleaned.length >= 3) {
        return cleaned;
      }
    }
  }

  return null;
}

function extractMerchantFromProcessorReceipt(text: string) {
  const patterns = [
    /(?:payment|paid|receipt|invoice)\s+(?:to|from|for)\s+([A-Za-z0-9&+.,'´`’\-\s]{3,70})/i,
    /(?:pago|pagaste|recibo|factura)\s+(?:a|de|para)\s+([A-Za-z0-9&+.,'´`’\-\s]{3,70})/i,
    /(?:merchant|comercio|seller|business|empresa)\s*[:\-]\s*([A-Za-z0-9&+.,'´`’\-\s]{3,70})/i,
    /(?:billing\s*agreement|acuerdo\s*de\s*pago)\D{0,40}([A-Za-z0-9&+.,'´`’\-\s]{3,70})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const candidate = match?.[1]?.trim();
    if (candidate) {
      const cleaned = cleanMerchantCandidate(candidate);
      if (
        cleaned.length >= 3 &&
        !/^(paypal|stripe|invoice|receipt|factura|recibo|payment|pago)$/i.test(cleaned)
      ) {
        return cleaned;
      }
    }
  }

  return null;
}

async function fetchGmailMessages(accessToken: string) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceQuery = `${since.getFullYear()}/${String(since.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(since.getDate()).padStart(2, "0")}`;

  const query =
    `after:${sinceQuery} (` +
    "subscription OR suscripción OR suscripcion OR membresia OR membership OR plan OR invoice OR paid invoice OR factura OR facturación OR bill OR billing OR receipt OR receipt from OR renewal OR renewed OR renovación OR renovada OR payment OR pago OR cobro OR cargo OR recordatorio OR vencimiento OR recibo OR comprobante OR estado de cuenta OR billing agreement OR automatic renewal" +
    ")";

  const listUrl =
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=120&q=" +
    encodeURIComponent(query);

  const listResponse = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!listResponse.ok) {
    const detail = await listResponse.text();
    throw new Error(`No se pudo consultar Gmail: ${detail || listResponse.status}`);
  }

  const listData = (await listResponse.json()) as GmailMessageListResponse;
  if (!listData.messages?.length) {
    return [];
  }

  const picked = listData.messages.slice(0, 60);

  const messages = await Promise.all(
    picked.map(async (message) => {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as GmailMessageResponse;
    }),
  );

  return messages.filter((message): message is GmailMessageResponse => Boolean(message));
}

function mapGmailMessage(message: GmailMessageResponse): EmailMessage {
  const headers = message.payload?.headers || [];
  const from = extractHeader(headers, "From") || "Correo detectado";
  const subject = extractHeader(headers, "Subject") || "Sin asunto";
  const body = collectBodyText(message.payload).join(" ");
  const date = message.internalDate ? new Date(Number(message.internalDate)) : null;

  return {
    id: message.id,
    from,
    subject,
    snippet: message.snippet || "",
    body,
    date,
  };
}

function normalizeDraftKey(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(inc|llc|ltda|sas|s\.a\.s|s\.a|colombia|latam)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function detectSubscriptionsFromMessages(
  messages: EmailMessage[],
  source: "gmail-detected" | "email-detected",
) {
  const byName = new Map<string, DetectedSubscriptionDraft>();
  const providerOccurrences = new Map<string, number>();
  const candidateMessages: Array<{
    message: EmailMessage;
    haystack: string;
    from: string;
    subject: string;
    provider: ProviderHint | null;
    providerName: string | null;
    amountData: ReturnType<typeof extractAmount>;
    recurring: boolean;
    processorReceipt: boolean;
    namedByStore: boolean;
  }> = [];

  for (const message of messages) {
    const from = message.from || "Correo detectado";
    const subject = message.subject || "Sin asunto";
    const haystack = `${subject} ${from} ${message.snippet || ""} ${message.body || ""}`;

    const storeSubscriptionName = extractStoreSubscriptionName(haystack);
    const processorReceipt = isPaymentProcessorSender(from);
    const processorMerchant = processorReceipt
      ? extractMerchantFromProcessorReceipt(haystack)
      : null;
    const providerName =
      storeSubscriptionName ||
      processorMerchant ||
      extractProviderName(haystack);
    const provider =
      findProvider(providerName || "") || findProviderForMessage(from, haystack);
    const recurring = isLikelyRecurring(haystack);
    const amountData = extractAmount(haystack);
    const receipt = isLikelyReceipt(haystack);
    const promotional = isLikelyPromotional(haystack) || isLikelyPromotionalSender(from);
    const blockedCommerce = isBlockedCommerceSender(from);
    const oneTimeCommerce = isLikelyOneTimeCommerce(haystack);
    const paymentContext = hasPaymentContext(haystack);

    if (!amountData || !receipt || !paymentContext || isLikelyInvoiceScam(haystack)) {
      continue;
    }

    if (
      (promotional || blockedCommerce || oneTimeCommerce) &&
      !recurring &&
      !provider &&
      !processorMerchant
    ) {
      continue;
    }

    if ((promotional || blockedCommerce) && oneTimeCommerce && !recurring) {
      continue;
    }

    const normalizedProvider = normalizeDraftKey(providerName || parseSenderName(from));
    providerOccurrences.set(
      normalizedProvider,
      (providerOccurrences.get(normalizedProvider) || 0) + 1,
    );

    candidateMessages.push({
      message,
      haystack,
      from,
      subject,
      provider,
      providerName,
      amountData,
      recurring,
      processorReceipt,
      namedByStore: Boolean(storeSubscriptionName),
    });
  }

  for (const candidate of candidateMessages) {
    const {
      message,
      haystack,
      from,
      subject,
      provider,
      providerName,
      amountData,
      recurring,
      processorReceipt,
      namedByStore,
    } = candidate;
    const normalizedProvider = normalizeDraftKey(providerName || parseSenderName(from));
    const occurrences = providerOccurrences.get(normalizedProvider) || 0;

    if (!provider && !recurring && !processorReceipt && occurrences < 2) {
      continue;
    }

    const parsedDate = extractDate(haystack);
    const cadenceDays = extractCadenceDays(haystack) || 30;
    const messageDate = message.date || null;
    const inferredDate = parsedDate || messageDate || addDefaultNextPaymentByCadence(cadenceDays);
    const nextPayment = ensureFutureDate(inferredDate);
    const inferredName = providerName || provider?.name || parseSenderName(from);
    const finalProvider = findProvider(inferredName) || provider;
    const inferredCategory = finalProvider?.category || fallbackCategory(haystack);
    const inferredIcon = finalProvider?.icon || inferredName.charAt(0).toUpperCase() || "S";
    const inferredColor = finalProvider?.color || "bg-emerald-500";

    const confidence =
      (finalProvider ? 60 : 45) +
      (recurring ? 20 : 0) +
      (amountData ? 20 : 0) +
      (providerName ? 10 : 0) +
      (parsedDate ? 10 : 0) +
      (occurrences >= 2 ? 10 : 0) +
      (processorReceipt ? 8 : 0) +
      (namedByStore ? 8 : 0);

    const draft: DetectedSubscriptionDraft = {
      id: toBase64(`${inferredName}-${subject}`).slice(0, 48),
      name: inferredName,
      category: inferredCategory,
      amount: amountData?.amount || 0,
      currency: amountData?.currency || "$",
      nextPaymentDate: nextPayment.toISOString().split("T")[0],
      isRecurring: true,
      icon: inferredIcon,
      color: inferredColor,
      source,
      confidence: Math.min(confidence, 99),
      from,
      subject,
    };

    if (draft.confidence < 75) {
      continue;
    }

    const existing = byName.get(normalizeDraftKey(inferredName));
    if (!existing || draft.confidence > existing.confidence) {
      byName.set(normalizeDraftKey(inferredName), draft);
    }
  }

  return Array.from(byName.values()).sort((a, b) => b.confidence - a.confidence);
}

export async function detectSubscriptionsFromGmail(accessToken: string) {
  const messages = await fetchGmailMessages(accessToken);
  return detectSubscriptionsFromMessages(messages.map(mapGmailMessage), "gmail-detected");
}

interface OutlookMessageResponse {
  id: string;
  subject?: string;
  receivedDateTime?: string;
  from?: { emailAddress?: { name?: string; address?: string } };
  bodyPreview?: string;
  body?: { content?: string };
}

interface OutlookMessagesResponse {
  value?: OutlookMessageResponse[];
}

async function fetchOutlookMessages(accessToken: string) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const filterDate = since.toISOString();
  const params = new URLSearchParams({
    "$top": "100",
    "$orderby": "receivedDateTime desc",
    "$select": "id,subject,from,receivedDateTime,bodyPreview,body",
    "$filter": `receivedDateTime ge ${filterDate}`,
  });

  const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.body-content-type="text"',
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`No se pudo consultar Outlook: ${detail || response.status}`);
  }

  const data = (await response.json()) as OutlookMessagesResponse;
  return (data.value || []).map((message): EmailMessage => {
    const senderName = message.from?.emailAddress?.name || "";
    const senderAddress = message.from?.emailAddress?.address || "";
    const from = senderName && senderAddress ? `${senderName} <${senderAddress}>` : senderAddress || senderName;
    const date = message.receivedDateTime ? new Date(message.receivedDateTime) : null;

    return {
      id: message.id,
      from,
      subject: message.subject || "Sin asunto",
      snippet: message.bodyPreview || "",
      body: message.body?.content || "",
      date,
    };
  });
}

export async function detectSubscriptionsFromOutlook(accessToken: string) {
  const messages = await fetchOutlookMessages(accessToken);
  return detectSubscriptionsFromMessages(messages, "email-detected");
}

export function saveDetectedSubscriptionsDrafts(
  drafts: DetectedSubscriptionDraft[],
) {
  const deduped = new Map<string, DetectedSubscriptionDraft>();
  for (const draft of drafts) {
    const key = normalizeDraftKey(draft.name);
    const existing = deduped.get(key);
    if (!existing || draft.confidence > existing.confidence) {
      deduped.set(key, draft);
    }
  }

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(deduped.values())));
}

export function readDetectedSubscriptionsDrafts() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return [] as DetectedSubscriptionDraft[];
  }

  try {
    const parsed = JSON.parse(raw) as DetectedSubscriptionDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearDetectedSubscriptionsDrafts() {
  sessionStorage.removeItem(SESSION_KEY);
}
