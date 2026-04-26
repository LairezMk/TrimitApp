import type { DetectedSubscriptionDraft } from "./gmailDetection";

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
    patterns: [/netflix/i],
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
    patterns: [/disney\+|disneyplus/i],
  },
  {
    name: "YouTube Premium",
    category: "Entretenimiento",
    icon: "Y",
    color: "bg-red-500",
    patterns: [/youtube premium|youtube memberships?/i],
  },
  {
    name: "Amazon Prime",
    category: "Entretenimiento",
    icon: "A",
    color: "bg-cyan-500",
    patterns: [/amazon prime|prime video/i],
  },
  {
    name: "Microsoft 365",
    category: "Productividad",
    icon: "M",
    color: "bg-blue-500",
    patterns: [/microsoft 365|office 365/i],
  },
  {
    name: "Adobe",
    category: "Productividad",
    icon: "A",
    color: "bg-red-500",
    patterns: [/adobe|creative cloud/i],
  },
  {
    name: "Claro",
    category: "Telefonía",
    icon: "C",
    color: "bg-red-500",
    patterns: [/claro/i],
  },
  {
    name: "Movistar",
    category: "Telefonía",
    icon: "M",
    color: "bg-cyan-500",
    patterns: [/movistar/i],
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
];

function toBase64(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeXmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractAmount(text: string) {
  const amountPatterns = [
    /\b(?:cop|usd|eur)\s*([$€]?\s*[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\b/i,
    /([$€]\s*[0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/i,
    /\b([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)\s*(cop|usd|eur)\b/i,
  ];

  const normalizeAmount = (raw: string) => {
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
  };

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

  return null;
}

function addDefaultNextPaymentDate() {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next;
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

function findProvider(text: string) {
  for (const hint of PROVIDER_HINTS) {
    if (hint.patterns.some((pattern) => pattern.test(text))) {
      return hint;
    }
  }
  return null;
}

function parseLineCandidates(text: string) {
  return text
    .split(/\r?\n|;/g)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4);
}

async function extractPdfText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const raw = new TextDecoder("latin1").decode(bytes);
  const chunks: string[] = [];
  const textObjectRegex = /\(([^()]*)\)/g;
  let match: RegExpExecArray | null = textObjectRegex.exec(raw);

  while (match) {
    const token = match[1].replace(/\\[rn]/g, " ").replace(/\\\)/g, ")");
    if (token.trim().length > 1) {
      chunks.push(token);
    }
    match = textObjectRegex.exec(raw);
  }

  if (!chunks.length) {
    return raw.replace(/[^\x20-\x7E\n\r]/g, " ");
  }

  return chunks.join("\n");
}

async function inflateRaw(input: Uint8Array) {
  type StreamFactory = new (format: string) => {
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
  };

  const StreamCtor = (
    globalThis as typeof globalThis & { DecompressionStream?: StreamFactory }
  ).DecompressionStream;

  if (!StreamCtor) {
    throw new Error(
      "Tu navegador no soporta descompresión de archivos Excel. Usa CSV o PDF con texto.",
    );
  }

  const stream = new StreamCtor("deflate-raw");
  const writer = stream.writable.getWriter();
  await writer.write(input);
  await writer.close();
  const buffer = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

async function extractXlsxText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const findEOCD = () => {
    const minPos = Math.max(0, bytes.length - 65557);
    for (let i = bytes.length - 22; i >= minPos; i--) {
      if (
        bytes[i] === 0x50 &&
        bytes[i + 1] === 0x4b &&
        bytes[i + 2] === 0x05 &&
        bytes[i + 3] === 0x06
      ) {
        return i;
      }
    }
    return -1;
  };

  const eocd = findEOCD();
  if (eocd < 0) {
    throw new Error("El archivo Excel no tiene un formato ZIP válido.");
  }

  const totalEntries = view.getUint16(eocd + 10, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const xmlChunks: string[] = [];

  let cursor = centralOffset;
  for (let index = 0; index < totalEntries; index++) {
    if (view.getUint32(cursor, true) !== 0x02014b50) {
      break;
    }

    const compressionMethod = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const fileNameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);
    const fileNameStart = cursor + 46;
    const fileName = decoder.decode(
      bytes.slice(fileNameStart, fileNameStart + fileNameLength),
    );

    cursor = fileNameStart + fileNameLength + extraLength + commentLength;

    if (
      !fileName.startsWith("xl/worksheets/") &&
      fileName !== "xl/sharedStrings.xml" &&
      fileName !== "xl/workbook.xml"
    ) {
      continue;
    }

    if (view.getUint32(localHeaderOffset, true) !== 0x04034b50) {
      continue;
    }

    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);

    let payload: Uint8Array;
    if (compressionMethod === 0) {
      payload = compressed;
    } else if (compressionMethod === 8) {
      payload = await inflateRaw(compressed);
    } else {
      continue;
    }

    const xml = decoder.decode(payload);
    const cleaned = decodeXmlEntities(
      xml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
    if (cleaned) {
      xmlChunks.push(cleaned);
    }
  }

  return xmlChunks.join("\n");
}

async function extractStatementText(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  if (extension === "pdf") {
    return extractPdfText(file);
  }

  if (extension === "csv") {
    return await file.text();
  }

  if (extension === "xlsx") {
    return extractXlsxText(file);
  }

  if (extension === "xls") {
    const bytes = new Uint8Array(await file.arrayBuffer());
    return new TextDecoder("latin1").decode(bytes);
  }

  throw new Error("Formato no soportado. Usa PDF o Excel.");
}

export async function detectSubscriptionsFromBankStatement(file: File) {
  const sourceText = await extractStatementText(file);
  const normalized = sourceText.replace(/\s+/g, " ").trim();
  const lines = parseLineCandidates(sourceText);
  const recurringKeywords =
    /(suscripci[oó]n|subscription|membres[ií]a|mensual|renovaci[oó]n|d[eé]bito autom[aá]tico|cargo recurrente)/i;

  const candidates = new Map<string, DetectedSubscriptionDraft>();
  const now = new Date();

  for (const line of lines) {
    const provider = findProvider(line) || findProvider(normalized);
    const amountData = extractAmount(line) || extractAmount(normalized);
    const dateData = extractDate(line);
    const hasRecurringHint = recurringKeywords.test(line) || recurringKeywords.test(normalized);

    if (!provider && !hasRecurringHint) {
      continue;
    }

    if (!amountData && !provider) {
      continue;
    }

    const name = provider?.name || "Suscripción detectada";
    const category = provider?.category || "Otros";
    const icon = provider?.icon || name.charAt(0).toUpperCase() || "S";
    const color = provider?.color || "bg-emerald-500";
    const baseDate = dateData || addDefaultNextPaymentDate();
    const nextDate = ensureFutureDate(baseDate);
    const confidence =
      (provider ? 55 : 30) + (amountData ? 25 : 0) + (dateData ? 10 : 0) + (hasRecurringHint ? 10 : 0);
    const key = name.toLowerCase();

    const draft: DetectedSubscriptionDraft = {
      id: toBase64(`${key}-${line.slice(0, 40)}-${now.getTime()}`),
      name,
      category,
      amount: amountData?.amount || 0,
      currency: amountData?.currency || "COP",
      nextPaymentDate: nextDate.toISOString().split("T")[0],
      isRecurring: true,
      icon,
      color,
      source: "bank-statement",
      confidence: Math.min(confidence, 98),
      from: file.name,
      subject: line.slice(0, 120) || "Detectada desde extracto bancario",
    };

    const previous = candidates.get(key);
    if (!previous || draft.confidence > previous.confidence) {
      candidates.set(key, draft);
    }
  }

  return Array.from(candidates.values()).sort((a, b) => b.confidence - a.confidence);
}
