import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCachedFeaturedProducts, getCachedProducts } from '@/services/productService.cached';
import type { Product, PaginationMeta } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PaginationLink from '@/components/ui/PaginationLink';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Deals & Offers | Crown Value Mart',
    description:
      'Discover the best deals and featured products at Crown Value Mart. Save big on groceries, electronics and more.',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/deals`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/deals`,
        ar: `${process.env.NEXT_PUBLIC_SITE_URL}/ar/deals`,
      },
    },
  };
}

export default async function DealsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('deals');
  const tn = await getTranslations('nav');
  const tc = await getTranslations('common');

  let featuredProducts: Product[] = [];
  let dealProducts: Product[] = [];
  let pagination: PaginationMeta | undefined;

  try {
    const [featuredRes, dealsRes] = await Promise.all([
      getCachedFeaturedProducts(),
      getCachedProducts({
        page: query.page ? Number(query.page) : 1,
        limit: 12,
      }),
    ]);
    featuredProducts = featuredRes.data ?? [];
    // Filter to only products with discounts for the deals grid
    const allProducts = dealsRes.data ?? [];
    dealProducts = allProducts.filter((p) => p.discountPercentage > 0);
    // If no discounted products, show all as deals
    if (dealProducts.length === 0) {
      dealProducts = allProducts;
    }
    pagination = dealsRes.pagination;
  } catch {
    // API unavailable — show empty state
  }

  const hasFeatured = featuredProducts.length > 0;
  const hasDeals = dealProducts.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: tn('home'), href: `/${locale}` },
          { label: tn('deals') },
        ]}
      />

      {/* Page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
      </div>

      {/* Deals banner */}
      <div className="bg-gradient-to-r from-primary to-primary-hover rounded-xl p-6 md:p-8 text-white">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          {t('save_up_to', { percent: '50' })}
        </h2>
        <p className="text-white/80 text-sm md:text-base mb-4">
          {tc('shop_now')}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="inline-block px-5 py-2 bg-white text-primary font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors"
        >
          {tc('shop_now')}
        </Link>
      </div>

      {/* Featured Products section */}
      {hasFeatured && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              {t('featured')}
            </h2>
            <Link
              href={`/${locale}/shop`}
              className="text-sm text-primary font-medium hover:underline"
            >
              {tc('view_all')}
            </Link>
          </div>
          <ProductGrid products={featuredProducts} variant="trending" />
        </section>
      )}

      {/* Hot Deals section */}
      {hasDeals && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">
              {t('hot_deals')}
            </h2>
          </div>
          <ProductGrid products={dealProducts} variant="trending" />
          {pagination && (
            <PaginationLink meta={pagination} className="pt-4" />
          )}
        </section>
      )}

      {/* Empty state */}
      {!hasFeatured && !hasDeals && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-text-muted mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {t('no_deals')}
          </h2>
          <p className="text-sm text-text-secondary mb-6 max-w-md">
            {t('no_deals_desc')}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            {tn('shop')}
          </Link>
        </div>
      )}
    </div>
  );
}
