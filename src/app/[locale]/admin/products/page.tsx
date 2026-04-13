import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {
  getFilters,
  getProducts,
  type GetProductsParams,
} from '@/services/productService';
import type { FiltersResponse, PaginationMeta, Product } from '@/types';
import AdminProductsContent from './AdminProductsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin_products' });

  return {
    title: `${t('title')} | Crown Value Mart`,
    description: t('meta_description'),
  };
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    subCategory?: string;
  }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('admin_products');
  const tNav = await getTranslations('nav');

  const productParams: GetProductsParams = {
    page: query.page ? Number(query.page) : 1,
    limit: 10,
    search: query.search || undefined,
    category: query.category || undefined,
    subCategory: query.subCategory || undefined,
  };

  let products: Product[] = [];
  let pagination: PaginationMeta | undefined;
  let filters: FiltersResponse | null = null;

  try {
    const [productsRes, filtersRes] = await Promise.all([
      getProducts(productParams),
      getFilters(),
    ]);

    products = productsRes.data ?? [];
    pagination = productsRes.pagination;
    filters = filtersRes.data ?? null;
  } catch {
    products = [];
    filters = null;
  }

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

      <AdminProductsContent
        products={products}
        pagination={pagination}
        filters={filters}
      />
    </div>
  );
}