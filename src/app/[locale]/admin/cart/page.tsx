import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminCartContent from './AdminCartContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin_cart' });

  return {
    title: `${t('title')} | Crown Value Mart`,
    description: t('meta_description'),
  };
}

export default async function AdminCartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin_cart');
  const tNav = await getTranslations('nav');

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <Breadcrumb
        items={[
          { label: tNav('home'), href: `/${locale}` },
          { label: t('title') },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="max-w-3xl text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <AdminCartContent />
    </div>
  );
}