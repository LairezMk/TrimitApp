import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import {
  convertCurrency,
  formatCurrencyAmount,
  formatCurrencyForDisplay,
  normalizeCurrencyCode,
  type SupportedCurrency,
} from "../utils/currency";

interface CurrencyDisplayContextValue {
  preferredCurrency: SupportedCurrency;
  formatMoney: (amount: number, sourceCurrency?: string) => string;
  convertMoney: (amount: number, sourceCurrency?: string) => number;
  normalizeCurrency: (currency: string) => SupportedCurrency;
}

const CurrencyDisplayContext = createContext<CurrencyDisplayContextValue>({
  preferredCurrency: "COP",
  formatMoney: (amount, sourceCurrency = "COP") =>
    formatCurrencyForDisplay(amount, sourceCurrency, "COP"),
  convertMoney: (amount, sourceCurrency = "COP") =>
    convertCurrency(amount, sourceCurrency, "COP"),
  normalizeCurrency: normalizeCurrencyCode,
});

export function CurrencyDisplayProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferredCurrency, setPreferredCurrency] = useState<SupportedCurrency>("COP");

  useEffect(() => {
    if (!user) {
      setPreferredCurrency("COP");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    return onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data() as Record<string, unknown> | undefined;
      const preferences = (data?.preferences as Record<string, unknown> | undefined) || {};
      const configured = typeof preferences.currency === "string" ? preferences.currency : "COP";
      setPreferredCurrency(normalizeCurrencyCode(configured));
    });
  }, [user]);

  const value = useMemo<CurrencyDisplayContextValue>(
    () => ({
      preferredCurrency,
      formatMoney: (amount: number, sourceCurrency = preferredCurrency) => {
        const numericAmount = Number.isFinite(amount) ? amount : 0;
        const source = normalizeCurrencyCode(sourceCurrency);
        if (source === preferredCurrency) {
          return formatCurrencyAmount(numericAmount, preferredCurrency);
        }
        return formatCurrencyForDisplay(numericAmount, source, preferredCurrency);
      },
      convertMoney: (amount: number, sourceCurrency = preferredCurrency) => {
        const numericAmount = Number.isFinite(amount) ? amount : 0;
        return convertCurrency(numericAmount, sourceCurrency, preferredCurrency);
      },
      normalizeCurrency: normalizeCurrencyCode,
    }),
    [preferredCurrency],
  );

  return (
    <CurrencyDisplayContext.Provider value={value}>
      {children}
    </CurrencyDisplayContext.Provider>
  );
}

export function useCurrencyDisplay() {
  return useContext(CurrencyDisplayContext);
}
