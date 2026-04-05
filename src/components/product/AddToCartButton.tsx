"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { addToCart } from "@/services/cartService";
import { useRouter } from "@/i18n/navigation";
import type { Product } from "@/types";
import { getLocalized } from "@/lib/utils";
import QuantityStepper from "./QuantityStepper";
import Button from "@/components/ui/Button";

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const [qty, setQty] = useState(product.minimumOrderQuantity || 1);
    const [loading, setLoading] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const router = useRouter();
    const t = useTranslations("common");
    const locale = useLocale();

    const title = getLocalized(product.title, locale);
    const finalPrice = product.price;

    const handleAddToCart = async () => {
        if (loading) return;

        const cartItem = {
            productId: product.id,
            title,
            price: finalPrice,
            quantity: qty,
            thumbnail: product.thumbnail,
        };

        if (!isAuthenticated) {
            addItem(cartItem);
            return;
        }

        setLoading(true);
        try {
            await addToCart(product.id, qty);
            addItem(cartItem);
        } catch {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        router.push("/checkout");
    };

    return (
        <div className="space-y-4">
            {/* Quantity */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-text-secondary font-medium">
                    {t("add")}:
                </span>
                <QuantityStepper
                    value={qty}
                    onChange={setQty}
                    min={product.minimumOrderQuantity || 1}
                    max={product.stock}
                    size="md"
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={handleBuyNow}
                    loading={loading}
                >
                    {t("buy_now")}
                </Button>
                <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    loading={loading}
                >
                    {t("add_to_cart")}
                </Button>
            </div>
        </div>
    );
}
