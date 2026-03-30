import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Success | Crown Value Mart',
};

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { locale } = await params;
  const { orderNumber } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('checkout');

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t('order_success')}
        </h1>
        <p className="text-text-secondary mb-6">{t('order_success_desc')}</p>

        {/* Order Number */}
        {orderNumber && (
          <div className="mb-8 inline-block rounded-lg bg-gray-50 border border-border px-6 py-3">
            <p className="text-sm text-text-muted mb-1">{t('order_number')}</p>
            <p className="text-lg font-bold text-text-primary">
              {orderNumber}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/orders`}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md border-2 border-primary text-primary hover:bg-primary-light transition-colors"
          >
            {t('view_orders')}
          </Link>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            {t('continue_shopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
