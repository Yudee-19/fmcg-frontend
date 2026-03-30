import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/api';
import type { Product, PaginationMeta } from '@/types';
import ProductGrid from '@/components/product/ProductGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PaginationLink from '@/components/ui/PaginationLink';

function formatCategoryName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const categoryName = formatCategoryName(category);

  return {
    title: `${categoryName} | Crown Value Mart`,
    description: `Shop the best ${categoryName} products at Crown Value Mart. Great prices and fast delivery.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/category/${category}`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/category/${category}`,
        hi: `${process.env.NEXT_PUBLIC_SITE_URL}/hi/category/${category}`,
        bn: `${process.env.NEXT_PUBLIC_SITE_URL}/bn/category/${category}`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, category } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('category');
  const tn = await getTranslations('nav');

  const categoryName = formatCategoryName(category);

  let products: Product[] = [];
  let pagination: PaginationMeta | undefined;

  try {
    const res = await getProducts({
      category: decodeURIComponent(category),
      page: query.page ? Number(query.page) : 1,
      limit: 12,
    });
    products = res.data ?? [];
    pagination = res.pagination;
  } catch {
    // API unavailable — show empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: tn('home'), href: `/${locale}` },
          { label: tn('shop'), href: `/${locale}/shop` },
          { label: categoryName },
        ]}
      />

      {/* Page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          {categoryName}
        </h1>
        {pagination && pagination.totalRecords > 0 && (
          <p className="text-sm text-text-secondary">
            {pagination.totalRecords}{' '}
            {pagination.totalRecords === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      {/* Products grid */}
      {products.length > 0 ? (
        <>
          <ProductGrid products={products} variant="trending" />
          {pagination && (
            <PaginationLink meta={pagination} className="pt-4" />
          )}
        </>
      ) : (
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {t('no_products')}
          </h2>
          <p className="text-sm text-text-secondary mb-6 max-w-md">
            {t('no_products_desc')}
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
