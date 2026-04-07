"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { usePreferenceStore } from "@/store/preferenceStore";
import { addToCart } from "@/services/cartService";
import { removeFromWishlist } from "@/services/wishlistService";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function WishlistContent() {
    const t = useTranslations("wishlist");
    const tCommon = useTranslations("common");

    const [mounted, setMounted] = useState(false);
    const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const items = useWishlistStore((s) => s.items);
    const toggle = useWishlistStore((s) => s.toggle);
    const addItem = useCartStore((s) => s.addItem);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const formatPrice = usePreferenceStore((s) => s.formatPrice);
    const _currency = usePreferenceStore((s) => s.currency);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="bg-bg-card rounded-xl border border-border p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <svg
                        className="h-8 w-8 text-text-muted"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </div>
                <p className="text-text-secondary text-lg mb-2">{t("empty")}</p>
                <Link href="/shop">
                    <Button size="lg" className="mt-4">
                        {t("empty_cta")}
                    </Button>
                </Link>
            </div>
        );
    }

    const handleAddToCart = async (item: (typeof items)[0]) => {
        if (loadingMap[item.productId]) return;

        const cartItem = {
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: 1,
            thumbnail: item.thumbnail,
        };

        if (!isAuthenticated) {
            addItem(cartItem);
            setAddedMap((prev) => ({ ...prev, [item.productId]: true }));
            setTimeout(() => {
                setAddedMap((prev) => ({
                    ...prev,
                    [item.productId]: false,
                }));
            }, 2000);
            return;
        }

        setLoadingMap((prev) => ({ ...prev, [item.productId]: true }));
        try {
            await addToCart(item.productId, 1);
            addItem(cartItem);
            setAddedMap((prev) => ({ ...prev, [item.productId]: true }));
            setTimeout(() => {
                setAddedMap((prev) => ({
                    ...prev,
                    [item.productId]: false,
                }));
            }, 2000);
        } catch {
            // Silently fail
        } finally {
            setLoadingMap((prev) => ({ ...prev, [item.productId]: false }));
        }
    };

    const handleRemove = async (item: (typeof items)[0]) => {
        if (loadingMap[`remove-${item.productId}`]) return;

        const wishlistItem = {
            productId: item.productId,
            title: item.title,
            price: item.price,
            thumbnail: item.thumbnail,
        };

        if (!isAuthenticated) {
            toggle(wishlistItem);
            return;
        }

        setLoadingMap((prev) => ({
            ...prev,
            [`remove-${item.productId}`]: true,
        }));
        try {
            await removeFromWishlist(item.productId);
            toggle(wishlistItem);
        } catch {
            // Silently fail
        } finally {
            setLoadingMap((prev) => ({
                ...prev,
                [`remove-${item.productId}`]: false,
            }));
        }
    };

    return (
        <>
            <p className="text-sm text-text-muted mb-4">
                {t("items_count", { count: items.length })}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                    <div
                        key={item.productId}
                        className="bg-bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-md"
                    >
                        <Link href={`/products/${item.productId}`}>
                            <div className="relative aspect-square bg-gray-50">
                                <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-contain p-4"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                />
                            </div>
                        </Link>

                        <div className="p-4">
                            <Link href={`/products/${item.productId}`}>
                                <h3 className="text-sm font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                            </Link>

                            <p className="text-lg font-bold text-primary mt-2">
                                {formatPrice(item.price)}
                            </p>

                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    fullWidth
                                    onClick={() => handleAddToCart(item)}
                                    loading={loadingMap[item.productId]}
                                    className="text-xs"
                                >
                                    {addedMap[item.productId]
                                        ? t("added_to_cart")
                                        : tCommon("add_to_cart")}
                                </Button>
                                <button
                                    onClick={() => handleRemove(item)}
                                    disabled={
                                        loadingMap[
                                            `remove-${item.productId}`
                                        ]
                                    }
                                    className="flex-shrink-0 p-2 rounded-md border border-border text-text-muted hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-40 cursor-pointer"
                                    title={t("remove")}
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
