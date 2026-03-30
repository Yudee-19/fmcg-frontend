import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import SupportContent from './SupportContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'support' });
  return {
    title: `${t('title')} | Crown Value Mart`,
    description: t('meta_description'),
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('support');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: t('title') },
        ]}
      />

      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        {t('title')}
      </h1>

      <SupportContent />
    </div>
  );
}
