import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CURRENCIES = {
  KWD: { symbol: 'د.ك', code: 'KWD', name: 'Kuwaiti Dinar', rate: 1 },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', rate: 3.26 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

interface PreferenceStore {
  currency: CurrencyCode;
  rates: typeof CURRENCIES;
  setCurrency: (code: CurrencyCode) => void;
  updateRates: (newRates: Record<string, number>) => void;
  formatPrice: (amountInKWD: number) => string;
}

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      currency: 'KWD',
      rates: { ...CURRENCIES },
      setCurrency: (currency) => set({ currency }),
      updateRates: (newRates) =>
        set((state) => ({
          rates: Object.fromEntries(
            Object.entries(state.rates).map(([code, data]) => [
              code,
              { ...data, rate: newRates[code] ?? data.rate },
            ])
          ) as typeof CURRENCIES,
        })),
      formatPrice: (amountInKWD) => {
        const { currency, rates } = get();
        const currencyData = rates[currency] ?? rates.KWD;
        const { symbol, rate } = currencyData;
        const converted = amountInKWD * rate;
        const formatted =
          converted < 10
            ? converted.toFixed(3)
            : converted < 1000
              ? converted.toFixed(2)
              : Math.round(converted).toLocaleString();
        return `${symbol}${formatted}`;
      },
    }),
    {
      name: 'crown-preferences',
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        // Reset to KWD if persisted currency no longer exists
        currency: persisted?.currency in CURRENCIES ? persisted.currency : 'KWD',
        rates: { ...CURRENCIES },
      }),
    }
  )
);
