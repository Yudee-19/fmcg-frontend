import type { Product } from "@/types";
import { getLocalized, getLocalizedRecord } from "@/lib/utils";

interface ProductJsonLdProps {
    product: Product;
    locale: string;
}

export default function ProductJsonLd({ product, locale }: ProductJsonLdProps) {
    const title = getLocalized(product.title, locale);
    const attributes = getLocalizedRecord(product.attributes, locale);

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: title,
        description: title,
        image: product.images,
        brand: {
            "@type": "Brand",
            name: attributes.brand ?? "Crown Value Mart",
        },
        sku: product.sku,
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "KWD",
            availability:
                product.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
            priceValidUntil: new Date(Date.now() + 7 * 86400000)
                .toISOString()
                .split("T")[0],
            seller: { "@type": "Organization", name: "Crown Value Mart" },
        },
        ...(product.reviewCount > 0 && {
            aggregateRating: {
                "@type": "AggregateRating",
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
                __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
            }}
        />
    );
}
