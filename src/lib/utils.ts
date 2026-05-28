import type { LocalizedString, LocalizedRecord } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '...';
}

// MongoDB ObjectId — 24 hex chars
export function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

// Pick slug if available, otherwise fall back to id — for product URLs
export function productPath(product: { id: string; slug?: string }): string {
  return `/products/${product.slug ?? product.id}`;
}

// --- Localization helpers ---

/**
 * Resolve a localized field to a plain string for the given locale.
 * Falls back to `en` if the locale key doesn't exist.
 */
export function getLocalized(
  field: LocalizedString | string | undefined | null,
  locale: string
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return (field as unknown as Record<string, string>)[locale] ?? field.en ?? '';
}

/**
 * Resolve a localized Record (e.g. attributes) to a plain Record for the given locale.
 */
export function getLocalizedRecord(
  field: LocalizedRecord | undefined | null,
  locale: string
): Record<string, any> {
  if (!field) return {};
  return (field as unknown as Record<string, Record<string, any>>)[locale] ?? field.en ?? {};
}

// --- Price helpers ---

/**
 * Compute final price after applying discount percentage.
 * Backend no longer returns finalPrice — compute client-side.
 */
export function getFinalPrice(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0) return price;
  return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
}

/**
 * Get discount percentage (kept for cases where you have raw price/discountPercentage).
 */
export function getDiscountPercentage(
  price: number,
  discountPercentage: number
): number {
  if (price <= 0 || discountPercentage <= 0) return 0;
  return Math.round(discountPercentage);
}
