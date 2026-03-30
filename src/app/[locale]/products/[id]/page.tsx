import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts, getNewArrivals } from '@/lib/api';
import type { Product } from '@/types';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StarRating from '@/components/ui/StarRating';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Badge from '@/components/ui/Badge';
import ProductGallery from '@/components/product/ProductGallery';
import ProductJsonLd from '@/components/product/ProductJsonLd';
import AddToCartButton from '@/components/product/AddToCartButton';
import WishlistButton from '@/components/product/WishlistButton';
import ReviewSection from '@/components/product/ReviewSection';
import ProductGrid from '@/components/product/ProductGrid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  try {
    const { data: product } = await getProduct(id);
    return {
      title: `${product.title} | Crown Value Mart`,
      description: product.description.slice(0, 160),
      keywords: [
        ...(product.tags ?? []),
        product.category,
        product.subCategory,
      ].filter(Boolean) as string[],
      openGraph: {
        title: product.title,
        description: product.description.slice(0, 160),
        images: [
          {
            url: product.thumbnail,
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
        type: 'website',
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/products/${id}`,
        languages: {
          en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/products/${id}`,
          hi: `${process.env.NEXT_PUBLIC_SITE_URL}/hi/products/${id}`,
          bn: `${process.env.NEXT_PUBLIC_SITE_URL}/bn/products/${id}`,
        },
      },
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('product');
  const tc = await getTranslations('common');
  const th = await getTranslations('home');

  let product: Product;
  try {
    const res = await getProduct(id);
    product = res.data;
  } catch {
    notFound();
  }

  // Parallel data fetching
  let relatedProducts: Product[] = [];
  let newArrivals: Product[] = [];
  try {
    const [relatedRes, arrivalsRes] = await Promise.all([
      getRelatedProducts(product.category, product.id),
      getNewArrivals(),
    ]);
    relatedProducts = relatedRes.data ?? [];
    newArrivals = arrivalsRes.data ?? [];
  } catch {
    // Non-critical data
  }

  const attributes = product.attributes ?? {};

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Home', href: `/${locale}` },
            {
              label: product.category.replace(/-/g, ' '),
              href: `/${locale}/category/${product.category}`,
            },
            { label: product.title },
          ]}
        />

        {/* Product main section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery */}
          <ProductGallery images={product.images} title={product.title} />

          {/* Details panel */}
          <div className="space-y-4">
            {/* Stock badge */}
            {product.stock > 0 ? (
              <Badge variant="new" className="bg-success">
                {t('in_stock')}
              </Badge>
            ) : (
              <Badge variant="status">{t('out_of_stock')}</Badge>
            )}

            <h1 className="text-2xl font-bold text-text-primary">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm text-text-secondary">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm text-text-muted">
                ({t('reviews', { count: product.reviewCount })})
              </span>
            </div>

            {/* Price */}
            <PriceDisplay
              price={product.finalPrice}
              originalPrice={
                product.discountPercentage > 0 ? product.price : undefined
              }
              size="lg"
            />

            {/* Wishlist */}
            <WishlistButton
              product={{
                productId: product.id,
                title: product.title,
                price: product.finalPrice,
                thumbnail: product.thumbnail,
              }}
              className="!bg-gray-100 hover:!bg-gray-200"
            />

            {/* Description / Details tabs */}
            <div className="border-t border-border pt-4">
              <div className="flex gap-6 border-b border-border mb-4">
                <span className="text-sm font-semibold text-primary border-b-2 border-primary pb-2">
                  {t('description')}
                </span>
                <span className="text-sm text-text-muted pb-2">
                  {t('details')}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.description}
              </p>

              {/* Attributes table */}
              {Object.keys(attributes).length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(attributes).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="text-text-muted capitalize">
                        {key}:
                      </span>
                      <span className="text-text-primary font-medium">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add to cart */}
            <AddToCartButton product={product} />

            {/* Trust badges */}
            <div className="flex items-center gap-6 pt-4 border-t border-border">
              {[
                { icon: '🚚', label: t('free_delivery') },
                { icon: '🔄', label: t('return_policy') },
                { icon: '🔒', label: t('secure_payment') },
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                {t('related')}
              </h2>
              <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                {tc('view_all')}
              </span>
            </div>
            <ProductGrid products={relatedProducts} variant="trending" />
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                {th('new_arrivals')}
              </h2>
              <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                {tc('view_all')}
              </span>
            </div>
            <ProductGrid products={newArrivals} variant="new-arrival" />
          </section>
        )}
      </div>
    </>
  );
}
