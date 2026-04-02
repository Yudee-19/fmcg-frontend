"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { getLocalized, getDiscountPercentage } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import PriceDisplay from "@/components/ui/PriceDisplay";
import QuantityStepper from "./QuantityStepper";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
    product: Product;
    variant?: "trending" | "new-arrival";
}

export default function ProductCard({
    product,
    variant = "trending",
}: ProductCardProps) {
    const [mounted, setMounted] = useState(false);
    const [qty, setQty] = useState(1);
    const addItem = useCartStore((s) => s.addItem);
    const t = useTranslations("common");
    const locale = useLocale();

    useEffect(() => setMounted(true), []);

    const title = getLocalized(product.title, locale);
    const finalPrice = product.price;
    const discount = getDiscountPercentage(
        product.price,
        product.discountPercentage,
    );

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem({
            productId: product.id,
            title,
            price: finalPrice,
            quantity: qty,
            thumbnail: product.thumbnail,
        });
        setQty(1);
    };

    return (
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
            {/* Image area */}
            <Link href={`/products/${product.id}`} className="block relative">
                <div className="relative aspect-square bg-gray-50 p-3">
                    <Image
                        src={product.thumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain group-hover:scale-105 transition-transform"
                    />
                    {/* Badge */}
                    {variant === "trending" && discount > 0 && (
                        <Badge
                            variant="discount"
                            className="absolute top-2 left-2"
                        >
                            -{discount}%
                        </Badge>
                    )}
                    {variant === "new-arrival" && (
                        <Badge variant="new" className="absolute top-2 left-2">
                            {t("new")}
                        </Badge>
                    )}
                    {/* Wishlist */}
                    <WishlistButton
                        product={{
                            productId: product.id,
                            title,
                            price: finalPrice,
                            thumbnail: product.thumbnail,
                        }}
                        className="absolute top-2 right-2"
                    />
                </div>
            </Link>

            {/* Info area */}
            <div className="p-3">
                <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-medium text-text-primary line-clamp-2 leading-snug min-h-[2.5rem]">
                        {title}
                    </h3>
                </Link>

                <PriceDisplay
                    price={finalPrice}
                    originalPrice={discount > 0 ? product.price : undefined}
                    size="sm"
                    className="mt-1.5"
                />

                {/* Actions */}
                <div className="mt-3">
                    {variant === "trending" ? (
                        <div className="flex items-center gap-2">
                            <QuantityStepper
                                value={qty}
                                onChange={setQty}
                                size="sm"
                            />
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-primary text-white text-sm font-medium py-1.5 px-3 rounded-md hover:bg-primary-hover transition-colors"
                            >
                                {t("add")}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded-md hover:bg-primary-hover transition-colors"
                            >
                                {t("add_to_cart")}
                            </button>
                            <QuantityStepper
                                value={qty}
                                onChange={setQty}
                                size="sm"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
