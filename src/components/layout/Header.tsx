"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useLoyaltyStore } from "@/store/loyaltyStore";
import { getCart } from "@/services/cartService";
import { mergeAndFetchWishlist } from "@/services/wishlistService";
import SearchBar from "@/components/ui/SearchBar";
import Image from "next/image";
import { Crown, Heart, Search, ShoppingCart, User } from "lucide-react";

export default function Header() {
    const [mounted, setMounted] = useState(false);
    const cartCount = useCartStore((s) => s.totalItems);
    const syncCart = useCartStore((s) => s.syncWithServer);
    const wishlistCount = useWishlistStore((s) => s.items.length);
    const syncWishlist = useWishlistStore((s) => s.syncWithServer);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const userRole = useAuthStore((s) => s.user?.role);
    const isAdmin = !!userRole && userRole !== "USER";
    const loyaltyPoints = useLoyaltyStore((s) => s.currentPoints);
    const pointsLoaded = useLoyaltyStore((s) => s.pointsLoaded);
    const fetchMyPoints = useLoyaltyStore((s) => s.fetchMyPoints);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (isAuthenticated && !pointsLoaded) fetchMyPoints();
    }, [isAuthenticated, pointsLoaded, fetchMyPoints]);

    // On app boot (fresh tab / refresh) — if the user is already authenticated,
    // pull their server cart + wishlist so items saved before don't appear empty
    // or stale.
    useEffect(() => {
        if (!isAuthenticated) return;
        let alive = true;
        getCart()
            .then((res) => {
                if (!alive) return;
                const items = res.data?.items ?? [];
                const total =
                    (res as any)?.cartSummary?.finalAmount ??
                    (res as any)?.cartSummary?.subtotal ??
                    items.reduce(
                        (s: number, i: any) => s + i.price * i.quantity,
                        0,
                    );
                syncCart(items, total);
            })
            .catch(() => {
                // ignore — leave persisted local cart untouched on network error
            });

        const localWishlistItems = useWishlistStore.getState().items;
        mergeAndFetchWishlist(localWishlistItems)
            .then((merged) => {
                if (!alive) return;
                syncWishlist(merged);
            })
            .catch(() => {
                // ignore — leave persisted local wishlist untouched on network error
            });

        return () => {
            alive = false;
        };
    }, [isAuthenticated, syncCart, syncWishlist]);

    return (
        <header className="bg-primary border-b border-primary sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                {/* Logo */}
                <Link href="/" className="shrink-0 flex items-center gap-1">
                    <Image
                        src="/logo.svg"
                        alt="ShopEase"
                        width={150}
                        height={150}
                        className="rounded-sm"
                    />
                </Link>

                {/* Search */}
                <SearchBar className="flex-1 max-w-2xl hidden sm:block md:ml-auto" />

                {/* Icons */}
                <div className="flex items-center gap-3 ml-auto">
                    {/* Mobile search toggle */}
                    <Link
                        href="/shop"
                        className="sm:hidden p-2  text-white transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </Link>

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="relative p-2 text-white  transition-colors"
                    >
                        <Heart className="w-5 h-5" />
                        {mounted && wishlistCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative p-2 text-white transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {mounted && cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Loyalty points — only when logged in */}
                    {mounted && isAuthenticated && (
                        <Link
                            href={isAdmin ? "/admin/loyalty" : "/loyalty"}
                            aria-label="Loyalty points"
                            className="relative p-2 text-white transition-colors"
                        >
                            <Crown className="w-5 h-5" />
                            {loyaltyPoints > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-black text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                                    {loyaltyPoints > 999 ? "999+" : loyaltyPoints}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* User */}
                    <Link
                        href={isAuthenticated ? "/profile" : "/auth/login"}
                        className="p-2 text-white transition-colors"
                    >
                        <User className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
