'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Search, Trash2, ShieldAlert, RefreshCw, PackageSearch, Plus, X, Upload, Pencil, Eye, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { getLocalized, getFinalPrice, formatDate } from '@/lib/utils';
import { createProduct, deleteProduct, getAdminProduct, updateProduct } from '@/services/admin/productService';
import { useAuthStore } from '@/store/authStore';
import type { FiltersResponse, PaginationMeta, Product } from '@/types';

interface AdminProductsContentProps {
  products: Product[];
  pagination?: PaginationMeta;
  filters: FiltersResponse | null;
}

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

interface ProductFormState {
  titleEn: string;
  titleAr: string;
  categoryEn: string;
  categoryAr: string;
  subCategoryEn: string;
  subCategoryAr: string;
  barcode: string;
  itemCode: string;
  sku: string;
  price: string;
  discountPercentage: string;
  stock: string;
  minimumOrderQuantity: string;
  warrantyEn: string;
  warrantyAr: string;
  tags: string;
  searchKeywords: string;
  attributes: string;
  isFeatured: boolean;
}

interface ExistingImageItem {
  url: string;
  sourceIndex: number;
}

interface PendingDeleteProduct {
  id: string;
  title: string;
}

const defaultAttributesValue = JSON.stringify(
  {
    en: {
      sensor: '24.2MP Full-Frame CMOS',
      video: '4K 60fps',
      color: 'Black',
    },
    ar: {
      sensor: '24.2 ميجابكسل',
      video: '4K 60fps',
      color: 'أسود',
    },
  },
  null,
  2
);

const defaultFormState: ProductFormState = {
  titleEn: '',
  titleAr: '',
  categoryEn: '',
  categoryAr: '',
  subCategoryEn: '',
  subCategoryAr: '',
  barcode: '',
  itemCode: '',
  sku: '',
  price: '',
  discountPercentage: '0',
  stock: '',
  minimumOrderQuantity: '1',
  warrantyEn: '',
  warrantyAr: '',
  tags: '',
  searchKeywords: '',
  attributes: defaultAttributesValue,
  isFeatured: false,
};

function ModalShell({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[30px] border border-white/70 bg-white/96 shadow-[0_28px_90px_rgba(19,18,22,0.28)]">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-[30px] border-b border-border/70 bg-white/95 px-6 py-5 backdrop-blur sm:px-7">
          <div>
            <h2 className="font-poppins text-2xl font-semibold text-text-primary">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm leading-6 text-text-secondary">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

export default function AdminProductsContent({
  products,
  pagination,
  filters,
}: AdminProductsContentProps) {
  const t = useTranslations('admin_products');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isLoadingEditProduct, setIsLoadingEditProduct] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(defaultFormState);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [originalImages, setOriginalImages] = useState<ExistingImageItem[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImageItem[]>([]);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<PendingDeleteProduct | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentSubCategory = searchParams.get('subCategory') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const categories = filters?.categories ?? [];

  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((category) => {
      if (seen.has(category.en)) return false;
      seen.add(category.en);
      return true;
    });
  }, [categories]);

  const subCategoryOptions = useMemo(() => {
    if (!currentCategory) return [];
    const selectedCategory = uniqueCategories.find((category) => category.en === currentCategory);
    if (!selectedCategory) return [];

    const seen = new Set<string>();
    return selectedCategory.subCategories.filter((subCategory) => {
      if (seen.has(subCategory.en)) return false;
      seen.add(subCategory.en);
      return true;
    });
  }, [currentCategory, uniqueCategories]);

  function updateParams(updates: Record<string, string | null>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    if (resetPage) {
      params.delete('page');
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success(t('filters_applied'));
    updateParams({ search: searchTerm.trim() || null });
  }

  function handleCategoryChange(category: string) {
    updateParams({
      category: category || null,
      subCategory: null,
    });
  }

  function handleSubCategoryChange(subCategory: string) {
    updateParams({ subCategory: subCategory || null });
  }

  function handleClearFilters() {
    setSearchTerm('');
    toast.success(t('filters_cleared'));
    router.push(pathname);
  }

  function handlePageChange(page: number) {
    updateParams({ page: String(page) }, false);
  }

  function updateFormField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function resetCreateForm() {
    setFormState(defaultFormState);
    setSelectedImages([]);
    setOriginalImages([]);
    setExistingImages([]);
    setEditingProductId(null);
  }

  function openCreateModal() {
    resetCreateForm();
    setModalMode('create');
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (isCreating || isLoadingEditProduct) return;
    setIsCreateOpen(false);
  }

  async function openEditModal(productId: string) {
    setModalMode('edit');
    setEditingProductId(productId);
    setIsCreateOpen(true);
    setIsLoadingEditProduct(true);

    try {
      const response = await getAdminProduct(productId);
      const product = response.data;
      const images = (product.images ?? []).map((url, index) => ({
        url,
        sourceIndex: index + 1,
      }));

      setOriginalImages(images);
      setExistingImages(images);
      setSelectedImages([]);
      setFormState({
        titleEn: product.title.en,
        titleAr: product.title.ar,
        categoryEn: product.category.en,
        categoryAr: product.category.ar,
        subCategoryEn: product.subCategory?.en ?? '',
        subCategoryAr: product.subCategory?.ar ?? '',
        barcode: product.barcode,
        itemCode: product.itemCode,
        sku: product.sku,
        price: String(product.price),
        discountPercentage: String(product.discountPercentage),
        stock: String(product.stock),
        minimumOrderQuantity: String(product.minimumOrderQuantity),
        warrantyEn: product.warrantyInformation?.en ?? '',
        warrantyAr: product.warrantyInformation?.ar ?? '',
        tags: (product.tags ?? []).join(','),
        searchKeywords: (product.searchKeywords ?? []).join(','),
        attributes: product.attributes
          ? JSON.stringify(product.attributes, null, 2)
          : defaultAttributesValue,
        isFeatured: product.isFeatured,
      });
    } catch (error: any) {
      toast.error(error.message || t('load_edit_failed'));
      setIsCreateOpen(false);
    } finally {
      setIsLoadingEditProduct(false);
    }
  }

  function buildCreateProductFormData() {
    const parsedAttributes = JSON.parse(formState.attributes);

    if (
      !parsedAttributes ||
      typeof parsedAttributes !== 'object' ||
      typeof parsedAttributes.en !== 'object' ||
      parsedAttributes.en === null ||
      typeof parsedAttributes.ar !== 'object' ||
      parsedAttributes.ar === null
    ) {
      throw new Error(t('attributes_invalid'));
    }

    if (selectedImages.length === 0) {
      throw new Error(t('images_required'));
    }

    const formData = new FormData();

    formData.append('titleEn', formState.titleEn.trim());
    formData.append('titleAr', formState.titleAr.trim());
    formData.append('categoryEn', formState.categoryEn.trim());
    formData.append('categoryAr', formState.categoryAr.trim());
    formData.append('subCategoryEn', formState.subCategoryEn.trim());
    formData.append('subCategoryAr', formState.subCategoryAr.trim());
    formData.append('barcode', formState.barcode.trim());
    formData.append('itemCode', formState.itemCode.trim());
    formData.append('sku', formState.sku.trim());
    formData.append('price', formState.price.trim());
    formData.append('discountPercentage', formState.discountPercentage.trim() || '0');
    formData.append('stock', formState.stock.trim());
    formData.append('isFeatured', String(formState.isFeatured));
    formData.append('minimumOrderQuantity', formState.minimumOrderQuantity.trim() || '1');
    formData.append('warrantyEn', formState.warrantyEn.trim());
    formData.append('warrantyAr', formState.warrantyAr.trim());
    formData.append('tags', formState.tags.trim());
    formData.append('searchKeywords', formState.searchKeywords.trim());
    formData.append('attributes', JSON.stringify(parsedAttributes));

    for (const file of selectedImages) {
      formData.append('images', file);
    }

    return formData;
  }

  function buildUpdateProductFormData() {
    const parsedAttributes = JSON.parse(formState.attributes);

    if (
      !parsedAttributes ||
      typeof parsedAttributes !== 'object' ||
      typeof parsedAttributes.en !== 'object' ||
      parsedAttributes.en === null ||
      typeof parsedAttributes.ar !== 'object' ||
      parsedAttributes.ar === null
    ) {
      throw new Error(t('attributes_invalid'));
    }

    const formData = new FormData();

    formData.append('titleEn', formState.titleEn.trim());
    formData.append('titleAr', formState.titleAr.trim());
    formData.append('categoryEn', formState.categoryEn.trim());
    formData.append('categoryAr', formState.categoryAr.trim());
    formData.append('subCategoryEn', formState.subCategoryEn.trim());
    formData.append('subCategoryAr', formState.subCategoryAr.trim());
    formData.append('price', formState.price.trim());
    formData.append('discountPercentage', formState.discountPercentage.trim() || '0');
    formData.append('stock', formState.stock.trim());
    formData.append('isFeatured', String(formState.isFeatured));
    formData.append('minimumOrderQuantity', formState.minimumOrderQuantity.trim() || '1');
    formData.append('warrantyEn', formState.warrantyEn.trim());
    formData.append('warrantyAr', formState.warrantyAr.trim());
    formData.append('tags', formState.tags.trim());
    formData.append('searchKeywords', formState.searchKeywords.trim());
    formData.append('attributes', JSON.stringify(parsedAttributes));

    const keptExistingIndices = existingImages.map((image) => image.sourceIndex);
    const newImageIndices = keptExistingIndices.length === 0
      ? selectedImages.map((_, index) => index)
      : selectedImages.map((_, index) => originalImages.length + index + 1);
    const imageMap = [...keptExistingIndices, ...newImageIndices];
    const deletedImages = originalImages
      .map((image) => image.sourceIndex)
      .filter((index) => !keptExistingIndices.includes(index));

    if (imageMap.length > 0) {
      formData.append('imgmap', JSON.stringify(imageMap));
    }

    if (deletedImages.length > 0) {
      formData.append('delimg', JSON.stringify(deletedImages));
    }

    for (const file of selectedImages) {
      formData.append('images', file);
    }

    return formData;
  }

  async function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);

    try {
      const formData = buildCreateProductFormData();
      await createProduct(formData);
      toast.success(t('create_success'));
      setIsCreateOpen(false);
      resetCreateForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || t('create_failed'));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveProduct(event: React.FormEvent<HTMLFormElement>) {
    if (modalMode === 'create') {
      await handleCreateProduct(event);
      return;
    }

    event.preventDefault();
    if (!editingProductId) return;

    setIsCreating(true);

    try {
      const formData = buildUpdateProductFormData();
      await updateProduct(editingProductId, formData);
      toast.success(t('update_success'));
      setIsCreateOpen(false);
      resetCreateForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || t('update_failed'));
    } finally {
      setIsCreating(false);
    }
  }

  function requestDelete(productId: string, productTitle: string) {
    setPendingDeleteProduct({ id: productId, title: productTitle });
  }

  function closeDeleteModal() {
    if (deletingId) return;
    setPendingDeleteProduct(null);
  }

  async function handleDelete(productId: string) {
    setDeletingId(productId);

    try {
      await deleteProduct(productId);
      toast.success(t('delete_success'));
      setPendingDeleteProduct(null);

      const shouldGoToPreviousPage =
        products.length === 1 && (pagination?.currentPage ?? 1) > 1;

      startTransition(() => {
        if (shouldGoToPreviousPage) {
          updateParams({ page: String((pagination?.currentPage ?? 1) - 1) }, false);
          return;
        }

        router.refresh();
      });
    } catch (error: any) {
      toast.error(error.message || t('delete_failed'));
    } finally {
      setDeletingId(null);
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">{t('login_required_title')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('login_required')}</p>
        <Link href="/auth/login" className="mt-6 inline-flex">
          <Button size="lg">{tAuth('login')}</Button>
        </Link>
      </div>
    );
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">{t('admin_only_title')}</h2>
        <p className="mt-2 text-sm text-text-secondary">{t('admin_only')}</p>
        <Link href="/" className="mt-6 inline-flex">
          <Button variant="outline" size="lg">{t('back_home')}</Button>
        </Link>
      </div>
    );
  }

  const hasActiveFilters = Boolean(currentSearch || currentCategory || currentSubCategory);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1.6fr)_minmax(10rem,0.95fr)_minmax(10rem,0.95fr)_auto_auto]">
            <div className="relative lg:col-span-2 2xl:col-span-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('search_placeholder')}
                className={`${inputClass} pl-11`}
              />
            </div>

            <select
              value={currentCategory}
              onChange={(event) => handleCategoryChange(event.target.value)}
              className={inputClass}
            >
              <option value="">{t('all_categories')}</option>
              {uniqueCategories.map((category) => (
                <option key={category.en} value={category.en}>
                  {getLocalized(category, locale)}
                </option>
              ))}
            </select>

            <select
              value={currentSubCategory}
              onChange={(event) => handleSubCategoryChange(event.target.value)}
              className={inputClass}
              disabled={!currentCategory}
            >
              <option value="">{t('all_subcategories')}</option>
              {subCategoryOptions.map((subCategory) => (
                <option key={subCategory.en} value={subCategory.en}>
                  {getLocalized(subCategory, locale)}
                </option>
              ))}
            </select>

            <Button type="submit" size="lg" className="rounded-xl px-5">
              {t('search_action')}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-xl px-5"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              {t('clear_filters')}
            </Button>
          </form>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/admin/products/import" className="inline-flex max-sm:w-full">
                <Button type="button" variant="outline" size="lg" className="rounded-xl px-5 max-sm:w-full">
                  <span className="inline-flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    {t('import_data')}
                  </span>
                </Button>
              </Link>
              <Button type="button" size="lg" className="rounded-xl px-5 max-sm:w-full" onClick={openCreateModal}>
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t('add_product')}
                </span>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-secondary lg:justify-end">
              <RefreshCw className={`h-4 w-4 shrink-0 ${isPending ? 'animate-spin' : ''}`} />
              <span>
                {pagination
                  ? t('showing_results', {
                      current: pagination.currentPage,
                      total: pagination.totalPages,
                      count: pagination.totalRecords,
                    })
                  : t('results_unavailable')}
              </span>
            </div>
          </div>
        </div>

      </section>

      {products.length === 0 ? (
        <div className="rounded-[28px] border border-border bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
            <PackageSearch className="h-9 w-9" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">{t('empty_title')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">{t('empty_description')}</p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-6 rounded-xl"
              onClick={handleClearFilters}
            >
              {t('clear_filters')}
            </Button>
          )}
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-[28px] border border-border bg-white shadow-sm">
            <div className="hidden xl:grid xl:grid-cols-[minmax(0,2.4fr)_1fr_1fr_0.85fr_0.8fr_8.5rem] gap-4 border-b border-border bg-primary-light/50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
              <span>{t('columns_product')}</span>
              <span>{t('columns_category')}</span>
              <span>{t('columns_subcategory')}</span>
              <span>{t('columns_price')}</span>
              <span>{t('columns_stock')}</span>
              <span className="text-right">{t('columns_actions')}</span>
            </div>

            <div className="divide-y divide-border">
              {products.map((product) => {
                const title = getLocalized(product.title, locale);
                const category = getLocalized(product.category, locale);
                const subCategory = getLocalized(product.subCategory, locale);
                const finalPrice = getFinalPrice(product.price, product.discountPercentage);

                return (
                  <article
                    key={product.id}
                    className="grid gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-[minmax(0,2.4fr)_1fr_1fr_0.85fr_0.8fr_8.5rem] xl:items-center"
                  >
                    <div className="flex items-start gap-4 min-w-0 md:col-span-2 xl:col-span-1">
                      <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border border-border bg-gray-50">
                        <Image
                          src={product.thumbnail}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/products/${product.id}`}
                          className="line-clamp-2 text-sm font-semibold text-text-primary transition-colors hover:text-primary"
                        >
                          {title}
                        </Link>
                        <p className="text-xs text-text-secondary">ID: {product.id}</p>
                        <p className="text-xs text-text-muted">{t('updated_at', { date: formatDate(product.updatedAt) })}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.14em] text-text-muted xl:hidden">{t('columns_category')}</p>
                      <p className="text-sm font-medium text-text-primary">{category || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.14em] text-text-muted xl:hidden">{t('columns_subcategory')}</p>
                      <p className="text-sm font-medium text-text-primary">{subCategory || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.14em] text-text-muted xl:hidden">{t('columns_price')}</p>
                      <PriceDisplay
                        price={finalPrice}
                        originalPrice={product.discountPercentage > 0 ? product.price : undefined}
                        size="sm"
                        className="gap-0"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.14em] text-text-muted xl:hidden">{t('columns_stock')}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {t('stock_label', { count: product.stock })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 md:col-span-2 xl:col-span-1 xl:justify-end xl:flex-nowrap">
                      <Link href={`/products/${product.id}`} className="inline-flex shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 rounded-lg p-0"
                          aria-label={t('view')}
                          title={t('view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 rounded-lg p-0 shrink-0"
                        onClick={() => openEditModal(product.id)}
                        disabled={isPending || deletingId === product.id}
                        aria-label={t('edit')}
                        title={t('edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 rounded-lg p-0 shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => requestDelete(product.id, title)}
                        loading={deletingId === product.id}
                        disabled={Boolean(deletingId && deletingId !== product.id) || isPending}
                        aria-label={deletingId === product.id ? t('deleting') : t('delete')}
                        title={deletingId === product.id ? t('deleting') : t('delete')}
                      >
                        {deletingId === product.id ? undefined : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {pagination && (
            <Pagination meta={pagination} onPageChange={handlePageChange} className="pt-2" />
          )}
        </>
      )}

      <ModalShell
        open={pendingDeleteProduct !== null}
        title={t('confirm_delete_title')}
        subtitle={t('confirm_delete_description', { title: pendingDeleteProduct?.title ?? '' })}
        onClose={closeDeleteModal}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {t('confirm_delete_warning')}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="rounded-xl"
              onClick={closeDeleteModal}
              disabled={Boolean(deletingId)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              size="lg"
              className="rounded-xl bg-red-600 hover:bg-red-700"
              onClick={() => pendingDeleteProduct && handleDelete(pendingDeleteProduct.id)}
              loading={Boolean(deletingId)}
            >
              {t('confirm_delete_action')}
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={isCreateOpen}
        title={modalMode === 'create' ? t('create_modal_title') : t('edit_modal_title')}
        subtitle={modalMode === 'create' ? t('create_modal_subtitle') : t('edit_modal_subtitle')}
        onClose={closeCreateModal}
      >
        {isLoadingEditProduct ? (
          <div className="space-y-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : (
        <form onSubmit={handleSaveProduct} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label htmlFor="titleEn" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_title_en')}</label>
              <input id="titleEn" value={formState.titleEn} onChange={(event) => updateFormField('titleEn', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="titleAr" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_title_ar')}</label>
              <input id="titleAr" value={formState.titleAr} onChange={(event) => updateFormField('titleAr', event.target.value)} className={inputClass} required dir="rtl" />
            </div>
            <div>
              <label htmlFor="barcode" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_barcode')}</label>
              <input id="barcode" value={formState.barcode} onChange={(event) => updateFormField('barcode', event.target.value)} className={inputClass} required disabled={modalMode === 'edit'} />
            </div>

            <div>
              <label htmlFor="categoryEn" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_category_en')}</label>
              <input id="categoryEn" value={formState.categoryEn} onChange={(event) => updateFormField('categoryEn', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="categoryAr" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_category_ar')}</label>
              <input id="categoryAr" value={formState.categoryAr} onChange={(event) => updateFormField('categoryAr', event.target.value)} className={inputClass} required dir="rtl" />
            </div>
            <div>
              <label htmlFor="itemCode" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_item_code')}</label>
              <input id="itemCode" value={formState.itemCode} onChange={(event) => updateFormField('itemCode', event.target.value)} className={inputClass} required disabled={modalMode === 'edit'} />
            </div>

            <div>
              <label htmlFor="subCategoryEn" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_subcategory_en')}</label>
              <input id="subCategoryEn" value={formState.subCategoryEn} onChange={(event) => updateFormField('subCategoryEn', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="subCategoryAr" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_subcategory_ar')}</label>
              <input id="subCategoryAr" value={formState.subCategoryAr} onChange={(event) => updateFormField('subCategoryAr', event.target.value)} className={inputClass} required dir="rtl" />
            </div>
            <div>
              <label htmlFor="sku" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_sku')}</label>
              <input id="sku" value={formState.sku} onChange={(event) => updateFormField('sku', event.target.value)} className={inputClass} required disabled={modalMode === 'edit'} />
            </div>

            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_price')}</label>
              <input id="price" type="number" min="0" step="0.01" value={formState.price} onChange={(event) => updateFormField('price', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="discountPercentage" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_discount_percentage')}</label>
              <input id="discountPercentage" type="number" min="0" step="1" value={formState.discountPercentage} onChange={(event) => updateFormField('discountPercentage', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="stock" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_stock')}</label>
              <input id="stock" type="number" min="0" step="1" value={formState.stock} onChange={(event) => updateFormField('stock', event.target.value)} className={inputClass} required />
            </div>

            <div>
              <label htmlFor="minimumOrderQuantity" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_minimum_order_quantity')}</label>
              <input id="minimumOrderQuantity" type="number" min="1" step="1" value={formState.minimumOrderQuantity} onChange={(event) => updateFormField('minimumOrderQuantity', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="warrantyEn" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_warranty_en')}</label>
              <input id="warrantyEn" value={formState.warrantyEn} onChange={(event) => updateFormField('warrantyEn', event.target.value)} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="warrantyAr" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_warranty_ar')}</label>
              <input id="warrantyAr" value={formState.warrantyAr} onChange={(event) => updateFormField('warrantyAr', event.target.value)} className={inputClass} required dir="rtl" />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label htmlFor="tags" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_tags')}</label>
              <input id="tags" value={formState.tags} onChange={(event) => updateFormField('tags', event.target.value)} className={inputClass} placeholder={t('field_tags_placeholder')} required />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label htmlFor="searchKeywords" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_search_keywords')}</label>
              <input id="searchKeywords" value={formState.searchKeywords} onChange={(event) => updateFormField('searchKeywords', event.target.value)} className={inputClass} placeholder={t('field_search_keywords_placeholder')} required />
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label htmlFor="attributes" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_attributes')}</label>
              <textarea
                id="attributes"
                value={formState.attributes}
                onChange={(event) => updateFormField('attributes', event.target.value)}
                className={`${inputClass} min-h-44 font-mono text-xs leading-6`}
                spellCheck={false}
                required
              />
              <p className="mt-2 text-xs text-text-secondary">{t('field_attributes_hint')}</p>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label htmlFor="images" className="mb-1.5 block text-sm font-medium text-text-primary">{t('field_images')}</label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-primary-light/30 px-6 py-8 text-center transition hover:border-primary/40 hover:bg-primary-light/50">
                <Upload className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{t('field_images_cta')}</p>
                  <p className="mt-1 text-xs text-text-secondary">{t('field_images_hint')}</p>
                </div>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    setSelectedImages(Array.from(event.target.files ?? []));
                  }}
                />
              </label>
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-text-primary">{t('existing_images')}</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {existingImages.map((image) => (
                      <div key={image.sourceIndex} className="overflow-hidden rounded-2xl border border-border bg-white">
                        <div className="relative aspect-square bg-gray-50">
                          <Image src={image.url} alt="Existing product image" fill className="object-cover" sizes="240px" />
                        </div>
                        <div className="flex items-center justify-between px-3 py-2">
                          <p className="text-xs text-text-secondary">{t('image_position', { index: image.sourceIndex })}</p>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                            onClick={() => setExistingImages((current) => current.filter((item) => item.sourceIndex !== image.sourceIndex))}
                          >
                            {t('remove_image')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-text-primary">{t('new_images')}</p>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {selectedImages.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{file.name}</p>
                          <p className="mt-1 text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                          onClick={() => setSelectedImages((current) => current.filter((item) => !(item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)))}
                        >
                          {t('remove_image')}
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="inline-flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={formState.isFeatured}
                  onChange={(event) => updateFormField('isFeatured', event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                {t('field_is_featured')}
              </label>
              {modalMode === 'edit' && (
                <p className="mt-2 text-xs text-text-secondary">{t('field_locked_on_edit')}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="lg" className="rounded-xl" onClick={closeCreateModal} disabled={isCreating}>
              {t('cancel')}
            </Button>
            <Button type="submit" size="lg" className="rounded-xl shadow-[0_14px_34px_rgba(196,30,58,0.18)]" loading={isCreating}>
              {modalMode === 'create' ? t('create_submit') : t('update_submit')}
            </Button>
          </div>
        </form>
        )}
      </ModalShell>
    </div>
  );
}