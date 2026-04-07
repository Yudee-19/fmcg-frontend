import { unstable_cache } from 'next/cache';
import {
  getProducts,
  getProduct,
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getProductReviews,
  getFilters,
} from './productService';
import type { GetProductsParams, GetReviewsParams } from './productService';

export const getCachedProducts = unstable_cache(
  async (params?: GetProductsParams) => getProducts(params),
  ['products'],
  { revalidate: 300, tags: ['products'] }
);

export const getCachedProduct = unstable_cache(
  async (id: string) => getProduct(id),
  ['product-detail'],
  { revalidate: 300, tags: ['product-detail'] }
);

export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);

export const getCachedFeaturedProducts = unstable_cache(
  async () => getFeaturedProducts(),
  ['featured-products'],
  { revalidate: 300, tags: ['featured-products'] }
);

export const getCachedNewArrivals = unstable_cache(
  async () => getNewArrivals(),
  ['new-arrivals'],
  { revalidate: 300, tags: ['new-arrivals'] }
);

export const getCachedProductReviews = unstable_cache(
  async (productId: string, params?: GetReviewsParams) =>
    getProductReviews(productId, params),
  ['product-reviews'],
  { revalidate: 60, tags: ['product-reviews'] }
);

export const getCachedFilters = unstable_cache(
  async () => getFilters(),
  ['product-filters'],
  { revalidate: 3600, tags: ['product-filters'] }
);
