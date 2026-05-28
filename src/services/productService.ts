import apiServer from './apiServer';
import type {
  ApiResponse,
  Product,
  ProductDetailApiResponse,
  CategoryDto,
  ReviewListResponse,
  ProductStatsDto,
  FiltersResponse,
} from '@/types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: string;
}

export interface GetReviewsParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export async function getProducts(
  params?: GetProductsParams
): Promise<ApiResponse<Product[]>> {
  const { data } = await apiServer.get<ApiResponse<Product[]>>('/products', {
    params,
  });
  return data;
}

export async function getProduct(
  id: string
): Promise<ProductDetailApiResponse> {
  const { data } = await apiServer.get<ProductDetailApiResponse>(
    `/products/${id}`
  );
  return data;
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetailApiResponse> {
  const { data } = await apiServer.get<ProductDetailApiResponse>(
    `/products/slug/${slug}`
  );
  return data;
}

export async function getProductSuggestions(
  q: string
): Promise<{ success: boolean; suggestions: string[] }> {
  const { data } = await apiServer.get<{ success: boolean; suggestions: string[] }>(
    '/products/suggestions',
    { params: { q } }
  );
  return data;
}

export async function getCategories(): Promise<ApiResponse<CategoryDto[]>> {
  const { data } = await apiServer.get<ApiResponse<CategoryDto[]>>(
    '/products/categories'
  );
  return data;
}

export async function getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
  const { data } = await apiServer.get<ApiResponse<Product[]>>('/products', {
    params: { isFeatured: true, limit: 8 },
  });
  return data;
}

export async function getNewArrivals(): Promise<ApiResponse<Product[]>> {
  const { data } = await apiServer.get<ApiResponse<Product[]>>('/products', {
    params: { limit: 8, sortBy: 'createdAt' },
  });
  return data;
}

export async function getProductReviews(
  productId: string,
  params?: GetReviewsParams
): Promise<ApiResponse<ReviewListResponse>> {
  const { data } = await apiServer.get<ApiResponse<ReviewListResponse>>(
    `/reviews/${productId}`,
    { params }
  );
  return data;
}

export async function getSubcategories(
  categoryName: string
): Promise<ApiResponse<string[]>> {
  const { data } = await apiServer.get<ApiResponse<string[]>>(
    `/products/categories/${categoryName}/subcategories`
  );
  return data;
}

export async function getFilters(): Promise<ApiResponse<FiltersResponse>> {
  const { data } = await apiServer.get<ApiResponse<FiltersResponse>>('/products/filters');
  return data;
}

export async function getProductStats(): Promise<
  ApiResponse<ProductStatsDto>
> {
  const { data } = await apiServer.get<ApiResponse<ProductStatsDto>>(
    '/products/stats'
  );
  return data;
}

export async function validateCategory(
  category: string
): Promise<ApiResponse<any>> {
  const { data } = await apiServer.post<ApiResponse<any>>(
    '/products/categories/validate',
    { category }
  );
  return data;
}
