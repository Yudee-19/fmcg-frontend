import type { Product } from '@/types';

export default function ProductJsonLd({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.attributes?.brand ?? 'Crown Value Mart',
    },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.finalPrice,
      priceCurrency: 'INR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .split('T')[0],
      seller: { '@type': 'Organization', name: 'Crown Value Mart' },
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
      }}
    />
  );
}
