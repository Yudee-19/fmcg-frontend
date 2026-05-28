import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AdminCouponDetail from './AdminCouponDetail';

export const metadata: Metadata = {
  title: 'Coupon Details | Crown Value Mart',
};

export default async function AdminCouponDetailPage({
  params,
}: {
  params: Promise<{ locale: string; couponId: string }>;
}) {
  const { locale, couponId } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumb
        items={[
          { label: 'Home', href: `/${locale}` },
          { label: 'Admin', href: `/${locale}/admin/products` },
          { label: 'Coupons', href: `/${locale}/admin/coupons` },
          { label: 'Detail' },
        ]}
      />
      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">
        Coupon Detail
      </h1>
      <AdminCouponDetail couponId={couponId} />
    </div>
  );
}
