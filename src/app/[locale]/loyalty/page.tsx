import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LoyaltyDashboard from './LoyaltyDashboard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  await getTranslations({ locale, namespace: 'loyalty' }).catch(() => null);
  return {
    title: 'My Loyalty Points | Crown Value Mart',
    description: 'Track and redeem your loyalty points at Crown Value Mart.',
  };
}

export default async function LoyaltyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('loyalty_page');
  const tNav = await getTranslations('nav');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: tNav('loyalty') },
        ]}
      />
      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        {t('title')}
      </h1>
      <LoyaltyDashboard />
    </div>
  );
}
