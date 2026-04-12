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
    patterns: [/netflix/i, /netflix\.com/i],
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
    name: "Adobe",
    category: "Productividad",
    icon: "A",
    color: "bg-red-500",
    patterns: [/adobe/i, /creative cloud/i],
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
  source: "gmail-detected";
  confidence: number;
  from: string;
  subject: string;
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
    return window.btoa(input);
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

function normalizeAmount(raw: string) {
  const trimmed = raw.replace(/\s/g, "");

  if (trimmed.includes(",") && trimmed.includes(".")) {
    const lastComma = trimmed.lastIndexOf(",");
    const lastDot = trimmed.lastIndexOf(".");
    if (lastComma > lastDot) {
      return Number(trimmed.replace(/\./g, "").replace(",", "."));
    }
    return Number(trimmed.replace(/,/g, ""));
  }

  if (trimmed.includes(",")) {
    const parts = trimmed.split(",");
    if (parts[parts.length - 1].length === 2) {
      return Number(trimmed.replace(/\./g, "").replace(",", "."));
    }
    return Number(trimmed.replace(/,/g, ""));
  }

  return Number(trimmed);
}

function extractAmount(text: string) {
  const amountPatterns = [
    /\b(?:cop|usd|eur)\s*([$€]?\s*[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\b/i,
    /([$€]\s*[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/i,
    /\b([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\s*(cop|usd|eur)\b/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    const target = (match[1] || "").replace(/[$€]/g, "").trim();
    const value = normalizeAmount(target);
    if (!Number.isFinite(value) || value <= 0) {
      continue;
    }

    const haystack = match[0].toLowerCase();
    const currency = haystack.includes("cop")
      ? "COP"
      : haystack.includes("eur") || haystack.includes("€")
      ? "EUR"
      : "$";

    return { amount: value, currency };
  }

  return null;
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
  return null;
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
    /\bcada\s*mes\b/.test(normalized) ||
    /\brenovaci[oó]n\s*autom[aá]tica\b/.test(normalized) ||
    /\bd[eé]bito\s*autom[aá]tico\b/.test(normalized) ||
    /\bcargo\s*recurrente\b/.test(normalized)
  ) {
    return 30;
  }

  return null;
}

function isLikelyRecurring(text: string) {
  const cadence = extractCadenceDays(text);
  if (cadence) {
    return true;
  }

  return /\bplan\b/.test(text.toLowerCase()) && /\bpago|cobro|factura|renov/i.test(text);
}

function parseSenderName(from: string) {
  const clean = from.replace(/["<>]/g, " ").trim();
  const emailMatch = clean.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);
  const domain = emailMatch?.[1]?.toLowerCase() || "";

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

async function fetchGmailMessages(accessToken: string) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const sinceQuery = `${since.getFullYear()}/${String(since.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(since.getDate()).padStart(2, "0")}`;

  const query =
    `after:${sinceQuery} (` +
    "subscription OR suscripción OR invoice OR factura OR renewal OR renovación OR payment OR cobro" +
    ")";

  const listUrl =
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=80&q=" +
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

  const picked = listData.messages.slice(0, 40);

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

export async function detectSubscriptionsFromGmail(accessToken: string) {
  const messages = await fetchGmailMessages(accessToken);
  const byName = new Map<string, DetectedSubscriptionDraft>();

  for (const message of messages) {
    const headers = message.payload?.headers || [];
    const from = extractHeader(headers, "From") || "Correo detectado";
    const subject = extractHeader(headers, "Subject") || "Sin asunto";
    const body = collectBodyText(message.payload).join(" ");
    const haystack = `${subject} ${from} ${message.snippet || ""} ${body}`;

    const provider = findProvider(haystack);
    const recurring = isLikelyRecurring(haystack);

    if (!provider && !recurring) {
      continue;
    }

    const amountData = extractAmount(haystack);
    const parsedDate = extractDate(haystack);
    const cadenceDays = extractCadenceDays(haystack) || 30;
    const messageDate = message.internalDate
      ? new Date(Number(message.internalDate))
      : null;
    const inferredDate = parsedDate || messageDate || addDefaultNextPaymentByCadence(cadenceDays);
    const nextPayment = ensureFutureDate(inferredDate);
    const inferredName = provider?.name || parseSenderName(from);
    const inferredCategory = provider?.category || fallbackCategory(haystack);
    const inferredIcon = provider?.icon || inferredName.charAt(0).toUpperCase() || "S";
    const inferredColor = provider?.color || "bg-emerald-500";

    const confidence =
      (provider ? 60 : 45) +
      (recurring ? 20 : 0) +
      (amountData ? 20 : 0) +
      (parsedDate ? 10 : 0);

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
      source: "gmail-detected",
      confidence: Math.min(confidence, 99),
      from,
      subject,
    };

    const existing = byName.get(inferredName.toLowerCase());
    if (!existing || draft.confidence > existing.confidence) {
      byName.set(inferredName.toLowerCase(), draft);
    }
  }

  return Array.from(byName.values()).sort((a, b) => b.confidence - a.confidence);
}

export function saveDetectedSubscriptionsDrafts(
  drafts: DetectedSubscriptionDraft[],
) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(drafts));
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
