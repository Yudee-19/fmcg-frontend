import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCachedProducts, getCachedCategories } from '@/services/productService.cached';
import type { Product, PaginationMeta, LocalizedString } from '@/types';
import { getLocalized } from '@/lib/utils';
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
    title: 'Shop All Products | Crown Value Mart',
    description:
      'Browse our wide selection of groceries, electronics, household essentials and more at Crown Value Mart.',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/shop`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/shop`,
        ar: `${process.env.NEXT_PUBLIC_SITE_URL}/ar/shop`,
      },
    },
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('shop');
  const tn = await getTranslations('nav');
  const tc = await getTranslations('common');

  let products: Product[] = [];
  let pagination: PaginationMeta | undefined;
  let categories: LocalizedString[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getCachedProducts({
        search: query.search,
        category: query.category,
        page: query.page ? Number(query.page) : 1,
        limit: 12,
      }),
      getCachedCategories(),
    ]);
    products = productsRes.data ?? [];
    pagination = productsRes.pagination;
    // Deduplicate by English name (API can return duplicates with different ar translations)
    const rawCats = categoriesRes.data ?? [];
    const seen = new Set<string>();
    categories = rawCats.filter((c) => {
      if (seen.has(c.en)) return false;
      seen.add(c.en);
      return true;
    });
  } catch {
    // API unavailable — show empty state
  }

  const currentCategory = query.category;
  const categoryLabel = currentCategory
    ? currentCategory.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: tn('home'), href: `/${locale}` },
          ...(categoryLabel
            ? [
                { label: tn('shop'), href: `/${locale}/shop` },
                { label: categoryLabel },
              ]
            : [{ label: tn('shop') }]),
        ]}
      />

      {/* Page heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          {query.search
            ? t('search_results', { query: query.search })
            : categoryLabel
              ? categoryLabel
              : t('title')}
        </h1>
        {pagination && pagination.totalRecords > 0 && (
          <p className="text-sm text-text-secondary">
            {t('showing_results', { count: pagination.totalRecords })}
          </p>
        )}
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/${locale}/shop`}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              !currentCategory
                ? 'bg-primary text-white border-primary'
                : 'border-border text-text-secondary hover:bg-gray-50'
            }`}
          >
            {t('all_products')}
          </Link>
          {categories.map((cat) => {
            const catEnName = cat.en;
            const displayName = getLocalized(cat, locale);
            const label = displayName
              .replace(/-/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const isActive = currentCategory === catEnName;
            return (
              <Link
                key={catEnName}
                href={`/${locale}/shop?category=${encodeURIComponent(catEnName)}`}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-text-secondary hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

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
          <div className="text-6xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-text-muted mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            {t('no_products')}
          </h2>
          <p className="text-sm text-text-secondary mb-6 max-w-md">
            {t('no_products_desc')}
          </p>
          {(query.search || query.category) && (
            <Link
              href={`/${locale}/shop`}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              {t('clear_filters')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
