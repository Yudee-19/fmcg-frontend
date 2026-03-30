'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from '@/i18n/navigation';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

export default function OrderSummary() {
  const [mounted, setMounted] = useState(false);
  const [coupon, setCoupon] = useState('');
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const router = useRouter();
  const t = useTranslations('cart');
  const tc = useTranslations('common');

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="bg-bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-xl border border-border p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        {t('order_summary')}
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">
            {t('items')} ({totalItems})
          </span>
          <PriceDisplay price={totalAmount} size="sm" />
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('shipping')}</span>
          <span className="text-success font-medium">{tc('free')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('discount')}</span>
          <span className="text-text-muted">-</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-semibold text-text-primary">{t('total')}</span>
          <PriceDisplay price={totalAmount} size="md" />
        </div>
      </div>

      {/* Coupon */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder={t('coupon_placeholder')}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button variant="primary" size="sm">
          {t('apply')}
        </Button>
      </div>

      {/* Checkout button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-4"
        onClick={() => router.push('/checkout')}
      >
        {t('checkout')}
      </Button>
    </div>
  );
}
