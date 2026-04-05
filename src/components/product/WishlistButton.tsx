"use client";

import { useState, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { addToWishlist, removeFromWishlist } from "@/services/wishlistService";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
    product: {
        productId: string;
        title: string;
        price: number;
        thumbnail: string;
    };
    className?: string;
    size?: "sm" | "md";
}

export default function WishlistButton({
    product,
    className,
    size = "sm",
}: WishlistButtonProps) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const toggle = useWishlistStore((s) => s.toggle);
    const isWishlisted = useWishlistStore((s) => s.isWishlisted);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => setMounted(true), []);

    const active = mounted && isWishlisted(product.productId);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (loading) return;

        if (!isAuthenticated) {
            // Still allow local toggle for unauthenticated users
            toggle(product);
            return;
        }

        setLoading(true);
        try {
            if (active) {
                await removeFromWishlist(product.productId);
            } else {
                await addToWishlist(product.productId);
            }
            // Only update store after successful API call
            toggle(product);
        } catch {
            // Silently fail — don't update store
        } finally {
            setLoading(false);
        }
    };

    const iconSize = size === "sm" ? "w-[18px] h-[18px]" : "w-5 h-5";

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={cn(
                "p-2 rounded-full bg-white shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-60 cursor-pointer",
                active && "bg-primary/5",
                className,
            )}
            aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        >
            <svg
                className={cn(
                    iconSize,
                    "transition-all duration-300",
                    active
                        ? "text-primary fill-primary scale-110"
                        : "text-text-secondary fill-none hover:text-primary",
                    loading && "animate-pulse",
                )}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
