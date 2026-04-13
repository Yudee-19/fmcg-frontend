'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/store/authStore';
import { bulkCreateProducts } from '@/services/admin/productService';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import * as XLSX from 'xlsx';
import {
  ShieldAlert,
  Upload,
  FileSpreadsheet,
  CircleCheck,
  CircleAlert,
  Database,
  Download,
} from 'lucide-react';

interface LocalizedString {
  en: string;
  ar: string;
}

interface LocalizedRecord {
  en: Record<string, unknown>;
  ar: Record<string, unknown>;
}

interface BulkImportProduct {
  title: LocalizedString;
  category: LocalizedString;
  subCategory: LocalizedString;
  barcode: string;
  itemCode: string;
  sku: string;
  price: number;
  discountPercentage: number;
  stock: number;
  isFeatured: boolean;
  minimumOrderQuantity: number;
  warrantyInformation?: LocalizedString;
  tags: string[];
  searchKeywords: string[];
  attributes?: LocalizedRecord;
}

const sampleWorksheetRows = [
  {
    'Serial No': 1,
    Barcode: '123456789012',
    'Item Code': 'HP001',
    'Description (EN)': 'Sony WH-1000XM5 Headphones',
    'Description (AR)': 'سماعات سوني WH-1000XM5',
    'Selling Price': 349.99,
    'Category (EN)': 'ELECTRONICS',
    'Category (AR)': 'الإلكترونيات',
    'Sub-Category (EN)': 'HEADPHONES',
    'Sub-Category (AR)': 'سماعات الرأس',
    'Discount Percentage': 10,
    Stock: 80,
    'Is Featured': true,
    'Minimum Order Quantity': 1,
    'Warranty (EN)': '1 year manufacturer warranty',
    'Warranty (AR)': 'ضمان الشركة المصنعة لمدة سنة',
    Tags: 'headphones,noise-cancelling,sony,wireless',
    'Search Keywords': 'sony,wh1000xm5,noise cancelling,headphones',
    'Attributes (EN)': '{"driver":"30mm","battery":"30 hours","color":"Black"}',
    'Attributes (AR)': '{"driver":"30 ملم","battery":"30 ساعة","color":"أسود"}',
    SKU: 'EL-H-HP001-9012',
  },
  {
    'Serial No': 2,
    Barcode: '987654321098',
    'Item Code': 'CAM002',
    'Description (EN)': 'Nikon Z50 Mirrorless Camera',
    'Description (AR)': 'كاميرا نيكون Z50 بدون مرآة',
    'Selling Price': 859.99,
    'Category (EN)': 'ELECTRONICS',
    'Category (AR)': 'الإلكترونيات',
    'Sub-Category (EN)': 'CAMERA',
    'Sub-Category (AR)': 'كاميرا',
    'Discount Percentage': 5,
    Stock: 30,
    'Is Featured': false,
    'Minimum Order Quantity': 1,
    'Warranty (EN)': '2 years manufacturer warranty',
    'Warranty (AR)': 'ضمان الشركة المصنعة لمدة سنتين',
    Tags: 'camera,nikon,mirrorless,aps-c',
    'Search Keywords': 'nikon,z50,mirrorless,camera',
    'Attributes (EN)': '{"sensor":"20.9MP APS-C CMOS","video":"4K UHD","color":"Black"}',
    'Attributes (AR)': '{"sensor":"20.9 ميجابكسل","video":"4K UHD","color":"أسود"}',
    SKU: 'EL-C-CAM002-1098',
  },
];

type WorksheetRow = Record<string, string | number | boolean | null | undefined>;

const columnAliases = {
  serialNo: ['Serial No', 'Serial Number', 'Serial'],
  barcode: ['Barcode'],
  itemCode: ['Item Code', 'ItemCode'],
  titleEn: ['Description (EN)', 'Title (EN)', 'titleEn'],
  titleAr: ['Description (AR)', 'Title (AR)', 'titleAr'],
  price: ['Selling Price', 'Price', 'price'],
  categoryEn: ['Category (EN)', 'categoryEn'],
  categoryAr: ['Category (AR)', 'categoryAr'],
  subCategoryEn: ['Sub-Category (EN)', 'Sub Category (EN)', 'subCategoryEn'],
  subCategoryAr: ['Sub-Category (AR)', 'Sub Category (AR)', 'subCategoryAr'],
  discountPercentage: ['Discount Percentage', 'discountPercentage'],
  stock: ['Stock'],
  isFeatured: ['Is Featured', 'isFeatured'],
  minimumOrderQuantity: ['Minimum Order Quantity', 'minimumOrderQuantity'],
  warrantyEn: ['Warranty (EN)', 'warrantyEn'],
  warrantyAr: ['Warranty (AR)', 'warrantyAr'],
  tags: ['Tags'],
  searchKeywords: ['Search Keywords', 'searchKeywords'],
  attributesEn: ['Attributes (EN)', 'attributesEn'],
  attributesAr: ['Attributes (AR)', 'attributesAr'],
  sku: ['SKU', 'sku'],
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLocalizedString(value: unknown): value is LocalizedString {
  return isRecord(value) && typeof value.en === 'string' && typeof value.ar === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLocalizedRecord(value: unknown): value is LocalizedRecord {
  return isRecord(value) && isRecord(value.en) && isRecord(value.ar);
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function getRowValue(row: WorksheetRow, aliases: readonly string[]) {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const found = entries.find(([key]) => normalizeHeader(key) === normalizeHeader(alias));
    if (found) {
      return found[1];
    }
  }
  return undefined;
}

function toTrimmedString(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number') return value;
  const normalized = toTrimmedString(value);
  if (!normalized) return fallback;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value;
  const normalized = toTrimmedString(value).toLowerCase();
  if (!normalized) return fallback;
  return ['true', '1', 'yes', 'y'].includes(normalized);
}

function toStringArray(value: unknown) {
  const normalized = toTrimmedString(value);
  if (!normalized) return [];
  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAttributesCell(value: unknown) {
  const normalized = toTrimmedString(value);
  if (!normalized) return {};
  const parsed = JSON.parse(normalized);
  if (!isRecord(parsed)) {
    throw new Error('Attributes cell must contain a JSON object.');
  }
  return parsed;
}

function abbreviateSegment(value: string) {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'X';
}

function buildSku(categoryEn: string, subCategoryEn: string, itemCode: string, barcode: string) {
  const categoryAbbr = abbreviateSegment(categoryEn);
  const subCategoryAbbr = abbreviateSegment(subCategoryEn);
  const lastBarcodeDigits = barcode.slice(-4);
  return `${categoryAbbr}-${subCategoryAbbr}-${itemCode}-${lastBarcodeDigits}`;
}

function validateProduct(product: unknown, index: number): string[] {
  const errors: string[] = [];

  if (!isRecord(product)) {
    return [`Product ${index + 1}: item must be an object.`];
  }

  if (!isLocalizedString(product.title)) {
    errors.push(`Product ${index + 1}: title must contain en and ar strings.`);
  }

  if (!isLocalizedString(product.category)) {
    errors.push(`Product ${index + 1}: category must contain en and ar strings.`);
  }

  if (!isLocalizedString(product.subCategory)) {
    errors.push(`Product ${index + 1}: subCategory must contain en and ar strings.`);
  }

  for (const key of ['barcode', 'itemCode', 'sku'] as const) {
    if (typeof product[key] !== 'string' || !product[key]?.trim()) {
      errors.push(`Product ${index + 1}: ${key} must be a non-empty string.`);
    }
  }

  for (const key of ['price', 'discountPercentage', 'stock', 'minimumOrderQuantity'] as const) {
    if (typeof product[key] !== 'number' || Number.isNaN(product[key])) {
      errors.push(`Product ${index + 1}: ${key} must be a number.`);
    }
  }

  if (typeof product.isFeatured !== 'boolean') {
    errors.push(`Product ${index + 1}: isFeatured must be a boolean.`);
  }

  if (product.warrantyInformation !== undefined && !isLocalizedString(product.warrantyInformation)) {
    errors.push(`Product ${index + 1}: warrantyInformation must contain en and ar strings.`);
  }

  if (!isStringArray(product.tags)) {
    errors.push(`Product ${index + 1}: tags must be an array of strings.`);
  }

  if (!isStringArray(product.searchKeywords)) {
    errors.push(`Product ${index + 1}: searchKeywords must be an array of strings.`);
  }

  if (product.attributes !== undefined && !isLocalizedRecord(product.attributes)) {
    errors.push(`Product ${index + 1}: attributes must contain en and ar objects.`);
  }

  return errors;
}

function parseImportRows(rows: WorksheetRow[]): { products: BulkImportProduct[]; errors: string[] } {
  if (rows.length === 0) {
    return { products: [], errors: ['Excel sheet is empty.'] };
  }

  const transformedProducts: BulkImportProduct[] = [];
  const transformErrors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const barcode = toTrimmedString(getRowValue(row, columnAliases.barcode));
      const itemCode = toTrimmedString(getRowValue(row, columnAliases.itemCode));
      const categoryEn = toTrimmedString(getRowValue(row, columnAliases.categoryEn));
      const categoryAr = toTrimmedString(getRowValue(row, columnAliases.categoryAr));
      const subCategoryEn = toTrimmedString(getRowValue(row, columnAliases.subCategoryEn));
      const subCategoryAr = toTrimmedString(getRowValue(row, columnAliases.subCategoryAr));
      const titleEn = toTrimmedString(getRowValue(row, columnAliases.titleEn));
      const titleAr = toTrimmedString(getRowValue(row, columnAliases.titleAr));
      const generatedSku = buildSku(categoryEn, subCategoryEn, itemCode, barcode);

      transformedProducts.push({
        title: { en: titleEn, ar: titleAr },
        category: { en: categoryEn, ar: categoryAr },
        subCategory: { en: subCategoryEn, ar: subCategoryAr },
        barcode,
        itemCode,
        sku: toTrimmedString(getRowValue(row, columnAliases.sku)) || generatedSku,
        price: toNumber(getRowValue(row, columnAliases.price)),
        discountPercentage: toNumber(getRowValue(row, columnAliases.discountPercentage), 0),
        stock: toNumber(getRowValue(row, columnAliases.stock), 0),
        isFeatured: toBoolean(getRowValue(row, columnAliases.isFeatured), false),
        minimumOrderQuantity: toNumber(getRowValue(row, columnAliases.minimumOrderQuantity), 1),
        warrantyInformation: {
          en: toTrimmedString(getRowValue(row, columnAliases.warrantyEn)),
          ar: toTrimmedString(getRowValue(row, columnAliases.warrantyAr)),
        },
        tags: toStringArray(getRowValue(row, columnAliases.tags)),
        searchKeywords: toStringArray(getRowValue(row, columnAliases.searchKeywords)),
        attributes: {
          en: parseAttributesCell(getRowValue(row, columnAliases.attributesEn)),
          ar: parseAttributesCell(getRowValue(row, columnAliases.attributesAr)),
        },
      });
    } catch (error: any) {
      const serialNo = toTrimmedString(getRowValue(row, columnAliases.serialNo));
      transformErrors.push(`Row ${serialNo || index + 2}: ${error.message}`);
    }
  });

  if (transformErrors.length > 0) {
    return { products: [], errors: transformErrors };
  }

  const validationErrors = transformedProducts.flatMap((product, index) => validateProduct(product, index));

  if (validationErrors.length > 0) {
    return { products: [], errors: validationErrors };
  }

  return { products: transformedProducts, errors: [] };
}

export default function ImportProductsContent() {
  const t = useTranslations('admin_product_import');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [products, setProducts] = useState<BulkImportProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totals = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const featuredCount = products.filter((product) => product.isFeatured).length;

    return {
      totalStock,
      featuredCount,
    };
  }, [products]);

  function handleDownloadSample() {
    const worksheet = XLSX.utils.json_to_sheet(sampleWorksheetRows, {
      header: [
        'Serial No',
        'Barcode',
        'Item Code',
        'Description (EN)',
        'Description (AR)',
        'Selling Price',
        'Category (EN)',
        'Category (AR)',
        'Sub-Category (EN)',
        'Sub-Category (AR)',
        'Discount Percentage',
        'Stock',
        'Is Featured',
        'Minimum Order Quantity',
        'Warranty (EN)',
        'Warranty (AR)',
        'Tags',
        'Search Keywords',
        'Attributes (EN)',
        'Attributes (AR)',
        'SKU',
      ],
    });

    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 16 },
      { wch: 14 },
      { wch: 32 },
      { wch: 32 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 10 },
      { wch: 12 },
      { wch: 24 },
      { wch: 28 },
      { wch: 28 },
      { wch: 28 },
      { wch: 34 },
      { wch: 42 },
      { wch: 42 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'product-import-sample.xls', { bookType: 'xls' });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setFeedback(null);
    setErrors([]);
    setProducts([]);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setErrors(['Excel file does not contain any sheet.']);
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<WorksheetRow>(worksheet, {
        defval: '',
      });

      const result = parseImportRows(rows);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }

      setProducts(result.products);
    } finally {
      setIsParsing(false);
    }
  }

  async function handleImport() {
    if (products.length === 0) {
      setFeedback({ type: 'error', message: t('no_valid_data') });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await bulkCreateProducts(products);
      setFeedback({ type: 'success', message: t('import_success', { count: products.length }) });
      setProducts([]);
      setErrors([]);
      setFileName('');
      startTransition(() => {
        router.push('/admin/products');
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: error.message || t('import_failed'),
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <Link href="/admin/products" className="mt-6 inline-flex">
          <Button variant="outline" size="lg">{t('back_to_products')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <section className="min-w-0 rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t('upload_title')}</h2>
            <p className="text-sm text-text-secondary">{t('upload_subtitle')}</p>
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-primary-light/25 px-6 py-12 text-center transition hover:border-primary/40 hover:bg-primary-light/40">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <p className="mt-4 text-base font-semibold text-text-primary">{t('upload_cta')}</p>
          <p className="mt-1 max-w-md text-sm text-text-secondary">{t('upload_hint')}</p>
          <input type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" onChange={handleFileChange} />
        </label>

        {fileName ? (
          <div className="mt-4 rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text-primary">
            <span className="font-medium">{t('selected_file')}</span> {fileName}
          </div>
        ) : null}

        {feedback ? (
          <div
            className={`mt-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {isParsing ? (
          <div className="mt-5 space-y-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        ) : null}

        {errors.length > 0 ? (
          <div className="mt-5 rounded-[24px] border border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-semibold text-red-700">{t('validation_errors')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-red-700">
              {errors.slice(0, 12).map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
            {errors.length > 12 ? (
              <p className="mt-3 text-xs text-red-600">{t('validation_errors_more', { count: errors.length - 12 })}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={handleImport} loading={isSubmitting || isPending} disabled={products.length === 0 || errors.length > 0}>
            {t('import_action')}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg">{t('back_to_products')}</Button>
          </Link>
        </div>
      </section>

      <section className="min-w-0 space-y-5">
        <div className="min-w-0 rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{t('preview_title')}</h2>
              <p className="text-sm text-text-secondary">{t('preview_subtitle')}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{t('summary_products')}</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{products.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{t('summary_stock')}</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{totals.totalStock}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{t('summary_featured')}</p>
              <p className="mt-2 text-2xl font-semibold text-text-primary">{totals.featuredCount}</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-border bg-gray-50 px-4 py-8 text-center text-sm text-text-secondary">
              {t('preview_empty')}
            </div>
          ) : (
            <div className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_0.8fr_0.7fr] gap-3 border-b border-border bg-primary-light/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                <span>{t('table_product')}</span>
                <span>{t('table_category')}</span>
                <span>{t('table_price')}</span>
                <span>{t('table_stock')}</span>
              </div>
              <div className="divide-y divide-border">
                {products.slice(0, 8).map((product) => (
                  <div key={product.barcode} className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_0.8fr_0.7fr] gap-3 px-4 py-4 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text-primary">{product.title.en}</p>
                      <p className="truncate text-xs text-text-secondary">{product.title.ar}</p>
                    </div>
                    <div className="min-w-0 text-text-primary">{product.category.en}</div>
                    <div className="text-primary font-semibold">KWD {product.price.toFixed(3)}</div>
                    <div className="text-text-primary">{product.stock}</div>
                  </div>
                ))}
              </div>
              {products.length > 8 ? (
                <div className="border-t border-border bg-gray-50 px-4 py-3 text-xs text-text-secondary">
                  {t('preview_more', { count: products.length - 8 })}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-[28px] border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{t('sample_title')}</h2>
              <p className="mt-2 text-sm text-text-secondary">{t('sample_subtitle')}</p>
            </div>
            <Button type="button" variant="outline" size="lg" className="shrink-0 rounded-xl" onClick={handleDownloadSample}>
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t('download_sample')}
              </span>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{t('step_one_label')}</p>
              <p className="mt-2 text-sm font-medium text-text-primary">{t('step_one_text')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{t('step_two_label')}</p>
              <p className="mt-2 text-sm font-medium text-text-primary">{t('step_two_text')}</p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{t('step_three_label')}</p>
              <p className="mt-2 text-sm font-medium text-text-primary">{t('step_three_text')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}