'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { useRouter } from '@/i18n/navigation';

export default function TrackOrderForm() {
  const t = useTranslations('track_order');
  const tOrder = useTranslations('order');
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;
    router.push(`/orders/${trimmed}`);
  };

  return (
    <div className="bg-bg-card rounded-xl border border-border p-6">
      <p className="text-text-secondary text-sm mb-6">
        {t('enter_order_number')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="orderNumber"
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            {tOrder('number')}
          </label>
          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={t('order_number_placeholder')}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={!orderNumber.trim()}
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {t('track_button')}
        </Button>
      </form>
    </div>
  );
}
