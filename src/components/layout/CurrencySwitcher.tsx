'use client';

import { useState, useEffect } from 'react';
import {
  usePreferenceStore,
  CURRENCIES,
  type CurrencyCode,
} from '@/store/preferenceStore';

export default function CurrencySwitcher() {
  const [mounted, setMounted] = useState(false);
  const currency = usePreferenceStore((s) => s.currency);
  const setCurrency = usePreferenceStore((s) => s.setCurrency);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className="text-xs text-white">INR</span>;
  }

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
      className="bg-transparent text-white text-xs border-none cursor-pointer focus:outline-none"
    >
      {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
        <option key={code} value={code} className="text-text-primary">
          {symbol} {code}
        </option>
      ))}
    </select>
  );
}
