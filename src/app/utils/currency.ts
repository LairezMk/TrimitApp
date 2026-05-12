export type SupportedCurrency = "COP" | "USD" | "EUR";

export function normalizeCurrencyCode(currency: string): SupportedCurrency {
  if (currency === "USD" || currency === "$") {
    return "USD";
  }
  if (currency === "EUR" || currency === "€") {
    return "EUR";
  }
  return "COP";
}

export function formatCurrencyAmount(value: number, currency: string) {
  const code = normalizeCurrencyCode(currency);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "COP" ? 0 : 2,
  }).format(value);
}

const USD_BASE_TO_TARGET: Record<SupportedCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  COP: 3950,
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
) {
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);
  const amountInUsd = amount / USD_BASE_TO_TARGET[from];
  const converted = amountInUsd * USD_BASE_TO_TARGET[to];
  if (to === "COP") {
    return Math.round(converted);
  }
  return Math.round(converted * 100) / 100;
}

export function formatCurrencyForDisplay(
  amount: number,
  sourceCurrency: string,
  preferredCurrency: string,
) {
  const converted = convertCurrency(amount, sourceCurrency, preferredCurrency);
  return formatCurrencyAmount(converted, preferredCurrency);
}

export function formatAmountInput(value: number, currency: string) {
  const code = normalizeCurrencyCode(currency);
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: code === "COP" ? 0 : 2,
  }).format(value);
}

export function parseAmountInput(input: string) {
  const clean = input.replace(/[^\d,.\-]/g, "").trim();
  if (!clean) {
    return null;
  }

  const hasComma = clean.includes(",");
  const hasDot = clean.includes(".");
  if (!hasComma && !hasDot) {
    const value = Number(clean);
    return Number.isFinite(value) ? value : null;
  }

  const normalized =
    hasComma && hasDot
      ? clean.lastIndexOf(",") > clean.lastIndexOf(".")
        ? clean.replace(/\./g, "").replace(",", ".")
        : clean.replace(/,/g, "")
      : hasComma
        ? clean.replace(/\./g, "").replace(",", ".")
        : clean;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function convertFromUsdPrice(usdPrice: number, targetCurrency: string) {
  const code = normalizeCurrencyCode(targetCurrency);
  const raw = usdPrice * USD_BASE_TO_TARGET[code];
  if (code === "COP") {
    return Math.round(raw / 100) * 100;
  }
  return Math.round(raw * 100) / 100;
}
