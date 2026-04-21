import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
    getCachedProducts,
    getCachedFilters,
} from "@/services/productService.cached";
import type { Product, PaginationMeta, FiltersResponse } from "@/types";
import ProductGrid from "@/components/product/ProductGrid";
import Breadcrumb from "@/components/ui/Breadcrumb";
import PaginationLink from "@/components/ui/PaginationLink";
import ShopFilters from "@/components/shop/ShopFilters";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: "Shop All Products | Crown Value Mart",
        description:
            "Browse our wide selection of groceries, electronics, household essentials and more at Crown Value Mart.",
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
        minPrice?: string;
        maxPrice?: string;
        sortBy?: string;
    }>;
}) {
    const { locale } = await params;
    const query = await searchParams;
    setRequestLocale(locale);

    const t = await getTranslations("shop");
    const tn = await getTranslations("nav");

    let products: Product[] = [];
    let pagination: PaginationMeta | undefined;
    let filters: FiltersResponse | null = null;

    try {
        const [productsRes, filtersRes] = await Promise.all([
            getCachedProducts({
                search: query.search,
                category: query.category,
                page: query.page ? Number(query.page) : 1,
                limit: 12,
                minPrice: query.minPrice ? Number(query.minPrice) : undefined,
                maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
                sortBy: query.sortBy || undefined,
            }),
            getCachedFilters(),
        ]);
        products = productsRes.data ?? [];
        pagination = productsRes.pagination;
        filters = filtersRes.data ?? null;
    } catch {
        // API unavailable — show empty state
    }

    const currentCategory = query.category;
    const categoryLabel = currentCategory
        ? currentCategory
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
        : null;

    // Build page title
    let pageTitle = t("title");
    if (query.search) {
        pageTitle = t("search_results", { query: query.search });
    } else if (categoryLabel) {
        pageTitle = categoryLabel;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: tn("home"), href: `/${locale}` },
                    ...(categoryLabel
                        ? [
                              { label: tn("shop"), href: `/${locale}/shop` },
                              { label: categoryLabel },
                          ]
                        : [{ label: tn("shop") }]),
                ]}
            />

            {/* Page heading + result count */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">
                    {pageTitle}
                </h1>
                {pagination && pagination.totalRecords > 0 && (
                    <p className="text-sm text-text-secondary mt-1">
                        {t("showing_results", {
                            count: pagination.totalRecords,
                        })}
                    </p>
                )}
            </div>

            {/* Main layout: sidebar + grid */}
            <div className="flex lg:flex-row flex-col gap-6 items-start">
                {/* Filter sidebar */}
                <ShopFilters filters={filters} />

                {/* Product grid area */}
                <div className="flex-1 lg:min-w-0 w-full">
                    {products.length > 0 ? (
                        <>
                            <ProductGrid
                                products={products}
                                variant="trending"
                            />
                            {pagination && (
                                <PaginationLink
                                    meta={pagination}
                                    className="pt-6"
                                />
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
                                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                            </svg>
                            <h2 className="text-lg font-semibold text-text-primary mb-2">
                                {t("no_products")}
                            </h2>
                            <p className="text-sm text-text-secondary mb-6 max-w-md">
                                {t("no_products_desc")}
                            </p>
                            {(query.search ||
                                query.category ||
                                query.minPrice ||
                                query.maxPrice) && (
                                <Link
                                    href={`/${locale}/shop`}
                                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    {t("clear_filters")}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
