import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getCachedProduct,
    getCachedProductBySlug,
    getCachedNewArrivals,
} from "@/services/productService.cached";
import type { Product, ProductListDto, ProductDetailApiResponse } from "@/types";
import { getLocalized, getLocalizedRecord, isObjectId, productPath } from "@/lib/utils";
import Breadcrumb from "@/components/ui/Breadcrumb";
import StarRating from "@/components/ui/StarRating";
import PriceDisplay from "@/components/ui/PriceDisplay";
import Badge from "@/components/ui/Badge";
import ProductGallery from "@/components/product/ProductGallery";
import ProductJsonLd from "@/components/product/ProductJsonLd";
import AddToCartButton from "@/components/product/AddToCartButton";
import NotifyRestockButton from "@/components/product/NotifyRestockButton";
import { EarnHint } from "@/components/loyalty/EarnHint";
import WishlistButton from "@/components/product/WishlistButton";
import ReviewSection from "@/components/product/ReviewSection";
import ProductGrid from "@/components/product/ProductGrid";

// Fetch by slug, falling back to id for legacy ObjectId URLs.
async function fetchProductByParam(param: string): Promise<ProductDetailApiResponse> {
    if (isObjectId(param)) {
        try {
            return await getCachedProduct(param);
        } catch {
            return await getCachedProductBySlug(param);
        }
    }
    try {
        return await getCachedProductBySlug(param);
    } catch {
        return await getCachedProduct(param);
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
    const { id: param, locale } = await params;
    try {
        const { data: product } = await fetchProductByParam(param);
        const title = getLocalized(product.title, locale);
        const category = getLocalized(product.category, locale);
        const subCategory = getLocalized(product.subCategory, locale);
        const canonicalSeg = product.slug ?? product.id;
        return {
            title: `${title} | Crown Value Mart`,
            description: title,
            keywords: [...(product.tags ?? []), category, subCategory].filter(
                Boolean,
            ) as string[],
            openGraph: {
                title,
                description: title,
                images: [
                    {
                        url: product.thumbnail,
                        width: 800,
                        height: 600,
                        alt: title,
                    },
                ],
                type: "website",
            },
            alternates: {
                canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/products/${canonicalSeg}`,
                languages: {
                    en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/products/${canonicalSeg}`,
                    ar: `${process.env.NEXT_PUBLIC_SITE_URL}/ar/products/${canonicalSeg}`,
                },
            },
        };
    } catch {
        return { title: "Product Not Found" };
    }
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    const { locale, id: param } = await params;
    setRequestLocale(locale);

    const t = await getTranslations("product");
    const tc = await getTranslations("common");
    const th = await getTranslations("home");

    let product: Product;
    let recommendations: ProductListDto[] = [];
    try {
        const res = await fetchProductByParam(param);
        product = res.data;
        recommendations = res.recommended ?? [];
    } catch {
        notFound();
    }

    // Resolve localized fields
    const title = getLocalized(product.title, locale);
    const category = getLocalized(product.category, locale);
    const categoryEn = getLocalized(product.category, "en");
    const attributes = getLocalizedRecord(product.attributes, locale);

    // Fetch new arrivals (non-critical)
    let newArrivals: Product[] = [];
    try {
        const arrivalsRes = await getCachedNewArrivals();
        newArrivals = arrivalsRes.data ?? [];
    } catch {
        // Non-critical data
    }

    return (
        <>
            <ProductJsonLd product={product} locale={locale} />
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: "Home", href: `/${locale}` },
                        {
                            label: category.replace(/-/g, " "),
                            href: `/${locale}/category/${encodeURIComponent(categoryEn)}`,
                        },
                        { label: title },
                    ]}
                />

                {/* Product main section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gallery */}
                    <ProductGallery images={product.images} title={title} />

                    {/* Details panel */}
                    <div className="space-y-4">
                        {/* Stock badge */}
                        {product.stock > 0 ? (
                            <Badge variant="new" className="bg-success">
                                {t("in_stock")}
                            </Badge>
                        ) : (
                            <Badge variant="status">{t("out_of_stock")}</Badge>
                        )}

                        <h1 className="text-2xl font-bold text-text-primary">
                            {title}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <StarRating rating={product.rating} size="md" />
                            <span className="text-sm text-text-secondary">
                                {product.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-text-muted">
                                ({t("reviews", { count: product.reviewCount })})
                            </span>
                        </div>

                        {/* Price */}
                        <PriceDisplay
                            price={product.price}
                            originalPrice={
                                product.discountPercentage > 0
                                    ? product.price
                                    : undefined
                            }
                            size="lg"
                        />

                        {/* Wishlist */}
                        <WishlistButton
                            product={{
                                productId: product.id,
                                title,
                                price: product.price,
                                thumbnail: product.thumbnail,
                            }}
                            className="!bg-gray-100 hover:!bg-gray-200"
                        />

                        {/* Details tab */}
                        <div className="border-t border-border pt-4">
                            <div className="flex gap-6 border-b border-border mb-4">
                                <span className="text-sm font-semibold text-primary border-b-2 border-primary pb-2">
                                    {t("details")}
                                </span>
                            </div>

                            {/* Attributes table */}
                            {Object.keys(attributes).length > 0 && (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(attributes).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex gap-2"
                                            >
                                                <span className="text-text-muted capitalize">
                                                    {key}:
                                                </span>
                                                <span className="text-text-primary font-medium">
                                                    {String(value)}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Loyalty earn hint */}
                        <EarnHint />

                        {/* Add to cart OR notify when back in stock */}
                        {product.stock > 0 ? (
                            <AddToCartButton product={product} />
                        ) : (
                            <NotifyRestockButton productId={product.id} />
                        )}

                        {/* Trust badges */}
                        <div className="flex items-center gap-6 pt-4 border-t border-border">
                            {[
                                { icon: "🚚", label: t("free_delivery") },
                                { icon: "🔄", label: t("return_policy") },
                                { icon: "🔒", label: t("secure_payment") },
                            ].map(({ icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-1.5 text-xs text-text-secondary"
                                >
                                    <span>{icon}</span>
                                    <span>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <ReviewSection
                    productId={product.id}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                />

                {/* Recommendations (from product detail response) */}
                {recommendations.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-text-primary">
                                {t("related")}
                            </h2>
                            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                                {tc("view_all")}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recommendations.map((rec) => {
                                const recTitle = getLocalized(
                                    rec.title as any,
                                    locale,
                                );
                                return (
                                    <a
                                        key={rec.id}
                                        href={`/${locale}${productPath(rec)}`}
                                        className="bg-bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow p-3"
                                    >
                                        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                                            <img
                                                src={rec.thumbnail}
                                                alt={recTitle}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        </div>
                                        <h3 className="text-sm font-medium text-text-primary line-clamp-2 min-h-[2.5rem]">
                                            {recTitle}
                                        </h3>
                                        <PriceDisplay
                                            price={rec.finalPrice ?? rec.price}
                                            originalPrice={
                                                rec.discountPercentage > 0
                                                    ? rec.price
                                                    : undefined
                                            }
                                            size="sm"
                                            className="mt-1"
                                        />
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* New Arrivals */}
                {newArrivals.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-text-primary">
                                {th("new_arrivals")}
                            </h2>
                            <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                                {tc("view_all")}
                            </span>
                        </div>
                        <ProductGrid
                            products={newArrivals}
                            variant="new-arrival"
                        />
                    </section>
                )}
            </div>
        </>
    );
}
