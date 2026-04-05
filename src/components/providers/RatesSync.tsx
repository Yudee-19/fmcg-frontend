'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { usePreferenceStore } from '@/store/preferenceStore';

export default function RatesSync() {
  const updateRates = usePreferenceStore((s) => s.updateRates);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await axios.get('/api/exchange-rates');
        if (data.rates) {
          updateRates(data.rates);
        }
      } catch {
        // Silently fail - fallback rates are already in the store
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, [updateRates]);

  return null;
}
