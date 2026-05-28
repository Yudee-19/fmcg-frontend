import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminCustomerLoyalty from './AdminCustomerLoyalty';

export const metadata: Metadata = {
  title: 'Customer Loyalty | Crown Value Mart',
};

export default async function AdminCustomerLoyaltyPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: 'Admin', href: `/${locale}/admin/products` },
          { label: 'Loyalty', href: `/${locale}/admin/loyalty` },
          { label: 'Customer' },
        ]}
      />
      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        Customer Loyalty Details
      </h1>
      <AdminCustomerLoyalty userId={userId} />
    </div>
  );
}
