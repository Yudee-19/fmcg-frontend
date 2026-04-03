"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { addToCart } from "@/lib/apiClient";
import type { Product } from "@/types";
import { getLocalized, getDiscountPercentage } from "@/lib/utils";
import PriceDisplay from "@/components/ui/PriceDisplay";
import StarRating from "@/components/ui/StarRating";
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
    const [adding, setAdding] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const t = useTranslations("common");
    const locale = useLocale();

    useEffect(() => setMounted(true), []);

    const title = getLocalized(product.title, locale);
    const finalPrice = product.price;
    const discount = getDiscountPercentage(
        product.price,
        product.discountPercentage,
    );
    const originalPrice =
        discount > 0
            ? Math.round(
                  (product.price / (1 - product.discountPercentage / 100)) *
                      100,
              ) / 100
            : undefined;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (adding) return;

        const cartItem = {
            productId: product.id,
            title,
            price: finalPrice,
            quantity: qty,
            thumbnail: product.thumbnail,
        };

        if (!isAuthenticated) {
            addItem(cartItem);
            setQty(1);
            return;
        }

        setAdding(true);
        try {
            await addToCart(product.id, qty);
            addItem(cartItem);
            setQty(1);
        } catch {
            // Silently fail — don't update store
        } finally {
            setAdding(false);
        }
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQty((q) => Math.max(1, q - 1));
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQty((q) => Math.min(99, q + 1));
    };

    return (
        <div className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
            {/* ── Image area with padding ── */}
            <Link
                href={`/products/${product.id}`}
                className="block relative p-4 pb-3"
            >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50/50">
                    <Image
                        src={product.thumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Discount badge — top left */}
                {discount > 0 && (
                    <span className="absolute top-5 left-5 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        -{discount}%
                    </span>
                )}

                {/* New badge */}
                {variant === "new-arrival" && (
                    <span className="absolute top-5 left-5 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {t("new")}
                    </span>
                )}

                {/* Wishlist heart — top right */}
                <WishlistButton
                    product={{
                        productId: product.id,
                        title,
                        price: finalPrice,
                        thumbnail: product.thumbnail,
                    }}
                    className="absolute top-5 right-5"
                    size="sm"
                />
            </Link>

            {/* ── Info area ── */}
            <div className="px-4 pb-4 pt-0 flex flex-col flex-1">
                <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug min-h-10">
                        {title}
                    </h3>
                </Link>

                {/* Price row */}
                <PriceDisplay
                    price={finalPrice}
                    originalPrice={originalPrice}
                    size="md"
                    className="mt-2"
                />

                {/* Star rating */}
                <div className="flex items-center gap-1.5 mt-1.5">
                    <StarRating rating={product.rating} size="sm" />
                    <span className="text-xs text-text-muted">
                        ({product.rating.toFixed(1)})
                    </span>
                </div>

                {/* Spacer to push actions to bottom */}
                <div className="flex-1" />

                {/* ── Actions row ── */}
                <div className="flex items-center gap-2 mt-4">
                    {/* Quantity stepper */}
                    <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={handleDecrement}
                            disabled={qty <= 1}
                            className="w-8 h-9 flex items-center justify-center text-text-secondary hover:bg-gray-50 disabled:opacity-30 transition-colors text-base cursor-pointer"
                        >
                            &minus;
                        </button>
                        <span className="w-8 h-9 flex items-center justify-center text-sm font-semibold text-text-primary border-x border-border">
                            {qty}
                        </span>
                        <button
                            onClick={handleIncrement}
                            disabled={qty >= 99}
                            className="w-8 h-9 flex items-center justify-center text-text-secondary hover:bg-gray-50 disabled:opacity-30 transition-colors text-base cursor-pointer"
                        >
                            +
                        </button>
                    </div>

                    {/* Add to cart button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="flex-1 h-9 inline-flex items-center justify-center gap-2 border-2 border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-60"
                    >
                        {adding ? "..." : t("add")}
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
