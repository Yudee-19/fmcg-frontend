import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import OrderDetail from './OrderDetail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}): Promise<Metadata> {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: 'order' });
  return {
    title: `${t('detail_title')} - ${orderNumber} | Crown Value Mart`,
    description: t('meta_description'),
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('order');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: t('title'), href: `/${locale}/orders` },
          { label: orderNumber },
        ]}
      />

      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        {t('detail_title')}
      </h1>

      <OrderDetail orderNumber={orderNumber} />
    </div>
  );
}
