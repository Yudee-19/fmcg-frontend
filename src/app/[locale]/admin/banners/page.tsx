import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminBannersContent from './AdminBannersContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin_banners' });
  return {
    title: `${t('title')} | Crown Value Mart`,
    description: t('meta_description'),
  };
}

export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin_banners');
  const tNav = await getTranslations('nav');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
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

      <AdminBannersContent />
    </div>
  );
}
