import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminCouponsContent from './AdminCouponsContent';

export const metadata: Metadata = {
  title: 'Coupons | Crown Value Mart',
};

export default async function AdminCouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: 'Admin', href: `/${locale}/admin/products` },
          { label: 'Coupons' },
        ]}
      />
      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        Coupons
      </h1>
      <AdminCouponsContent />
    </div>
  );
}
