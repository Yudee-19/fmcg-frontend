'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/cartStore';
import Skeleton from '@/components/ui/Skeleton';
import CartItem from './CartItem';

export default function CartTable() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const t = useTranslations('cart');

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-text-muted mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
          />
        </svg>
        <p className="text-text-secondary text-lg mb-2">{t('empty')}</p>
        <Link
          href="/shop"
          className="inline-block bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
        >
          {t('empty_cta')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border text-left text-sm text-text-secondary">
              <th className="pb-3 pr-4 font-medium">{t('product')}</th>
              <th className="pb-3 px-4 font-medium hidden sm:table-cell">
                {t('price')}
              </th>
              <th className="pb-3 px-4 font-medium">{t('quantity')}</th>
              <th className="pb-3 px-4 font-medium hidden md:table-cell">
                {t('subtotal')}
              </th>
              <th className="pb-3 pl-4 font-medium">{t('action')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <Link
          href="/shop"
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
        >
          <span>←</span> {t('continue_shopping')}
        </Link>
        <button
          onClick={clearCart}
          className="text-sm text-text-muted hover:text-primary transition-colors"
        >
          {t('clear_cart')}
        </button>
      </div>
    </div>
  );
}
