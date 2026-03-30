import type { ApiResponse, Product, Review, ReviewStats } from '@/types';

const API = process.env.NEXT_PUBLIC_API_URL!;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const getProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) => {
  const q = new URLSearchParams(
    Object.entries(params ?? {}).reduce(
      (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
      {} as Record<string, string>
    )
  ).toString();
  return apiFetch<ApiResponse<Product[]>>(`/products${q ? `?${q}` : ''}`, {
    next: { revalidate: 300 },
  });
};

export const getProduct = (id: string) =>
  apiFetch<ApiResponse<Product>>(`/products/${id}`, {
    next: { revalidate: 300 },
  });

export const getCategories = () =>
  apiFetch<ApiResponse<string[]>>('/products/categories', {
    next: { revalidate: 3600 },
  });

export const getFeaturedProducts = () =>
  apiFetch<ApiResponse<Product[]>>('/products?isFeatured=true&limit=8', {
    next: { revalidate: 300 },
  });

export const getNewArrivals = () =>
  apiFetch<ApiResponse<Product[]>>('/products?limit=8&sort=-createdAt', {
    next: { revalidate: 300 },
  });

export const getProductReviews = (
  productId: string,
  params?: { page?: number; limit?: number; sort?: string }
) => {
  const q = new URLSearchParams(
    Object.entries(params ?? {}).reduce(
      (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
      {} as Record<string, string>
    )
  ).toString();
  return apiFetch<ApiResponse<Review[]> & { stats?: ReviewStats }>(
    `/reviews/${productId}${q ? `?${q}` : ''}`,
    { next: { revalidate: 60 } }
  );
};

export const getRelatedProducts = (category: string, excludeId: string) =>
  apiFetch<ApiResponse<Product[]>>(
    `/products?category=${encodeURIComponent(category)}&limit=4`,
    { next: { revalidate: 300 } }
  ).then((res) => ({
    ...res,
    data: res.data.filter((p) => p.id !== excludeId),
  }));
