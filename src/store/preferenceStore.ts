import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', rate: 1 },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', rate: 0.012 },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', rate: 0.0095 },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', rate: 0.011 },
  AED: { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham', rate: 0.044 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

interface PreferenceStore {
  currency: CurrencyCode;
  rates: typeof CURRENCIES;
  setCurrency: (code: CurrencyCode) => void;
  updateRates: (newRates: Record<string, number>) => void;
  formatPrice: (amountInINR: number) => string;
}

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      currency: 'INR',
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
      formatPrice: (amountInINR) => {
        const { currency, rates } = get();
        const { symbol, rate } = rates[currency];
        const converted = amountInINR * rate;
        const formatted =
          converted < 10
            ? converted.toFixed(2)
            : converted < 1000
              ? converted.toFixed(0)
              : Math.round(converted).toLocaleString();
        return `${symbol}${formatted}`;
      },
    }),
    { name: 'crown-preferences' }
  )
);
