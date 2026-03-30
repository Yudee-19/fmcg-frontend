import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CartTable from '@/components/cart/CartTable';
import OrderSummary from '@/components/cart/OrderSummary';

export const metadata: Metadata = {
  title: 'Shopping Cart',
};

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cart');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: t('title') },
        ]}
      />

      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        {t('title')}
      </h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <CartTable />
        </div>
        <div className="mt-8 lg:mt-0">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
