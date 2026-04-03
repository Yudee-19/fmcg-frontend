import type {
    ApiResponse,
    Product,
    ProductListDto,
    ProductDetailApiResponse,
    ReviewListResponse,
    CategoryDto,
    ProductStatsDto,
} from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
}

// ─── Products ───────────────────────────────────────────────────────────────

export const getProducts = (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    tags?: string;
    sort?: string;
}) => {
    const q = new URLSearchParams(
        Object.entries(params ?? {}).reduce(
            (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
            {} as Record<string, string>,
        ),
    ).toString();
    return apiFetch<ApiResponse<Product[]>>(`/products${q ? `?${q}` : ""}`, {
        next: { revalidate: 300 },
    });
};

// GET /products/:id — product is `data`, recommendations are top-level `recommended`
export const getProduct = (id: string) =>
    apiFetch<ProductDetailApiResponse>(`/products/${id}`, {
        next: { revalidate: 300 },
    });

// Categories now return LocalizedString[] (e.g. [{ en: "BABY CARE", ar: "رعاية الأطفال" }, ...])
export const getCategories = () =>
    apiFetch<ApiResponse<CategoryDto[]>>("/products/categories", {
        next: { revalidate: 3600 },
    });

export const getFeaturedProducts = () =>
    apiFetch<ApiResponse<Product[]>>("/products?isFeatured=true&limit=8", {
        next: { revalidate: 300 },
    });

export const getNewArrivals = () =>
    apiFetch<ApiResponse<Product[]>>("/products?limit=8&sortBy=createdAt", {
        next: { revalidate: 300 },
    });

// ─── Reviews ────────────────────────────────────────────────────────────────

export const getProductReviews = (
    productId: string,
    params?: { page?: number; limit?: number; sort?: string },
) => {
    const q = new URLSearchParams(
        Object.entries(params ?? {}).reduce(
            (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
            {} as Record<string, string>,
        ),
    ).toString();
    return apiFetch<ApiResponse<ReviewListResponse>>(
        `/reviews/${productId}${q ? `?${q}` : ""}`,
        { next: { revalidate: 60 } },
    );
};

// ─── Filters & Stats ────────────────────────────────────────────────────────

export const getSubcategories = (categoryName: string) =>
    apiFetch<ApiResponse<string[]>>(
        `/products/categories/${encodeURIComponent(categoryName)}/subcategories`,
        { next: { revalidate: 3600 } },
    );

// Old filters endpoint
export const getFilters = () =>
    apiFetch<ApiResponse<any>>("/products/filters", {
        next: { revalidate: 3600 },
    });

// NEW: Aggregated filters with values (categories, subcategories, tags, priceRange, ratings)
export const getAllFilters = () =>
    apiFetch<
        ApiResponse<{
            categories: string[];
            subCategories: string[];
            tags: string[];
            priceRange: { min: number; max: number };
            ratings: number[];
        }>
    >("/products/all-filters", {
        next: { revalidate: 3600 },
    });

export const getProductStats = () =>
    apiFetch<ApiResponse<ProductStatsDto>>("/products/stats", {
        next: { revalidate: 300 },
    });

export const validateCategory = (category: string) =>
    apiFetch<ApiResponse<any>>("/products/validate-category", {
        method: "POST",
        body: JSON.stringify({ category }),
    });
