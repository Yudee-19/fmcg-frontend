"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn, getLocalized } from "@/lib/utils";
import { Menu } from "lucide-react";
import type { LocalizedString } from "@/types";

const NAV_ITEMS = [
    { key: "deals", href: "/deals" },
    { key: "home", href: "/" },
    { key: "shop", href: "/shop" },
    { key: "new_arrivals", href: "/shop?sort=newest" },
    { key: "best_sellers", href: "/shop?sort=popular" },
    { key: "track_order", href: "/track-order" },
    { key: "contact_us", href: "/support" },
] as const;

const CATEGORY_ICONS: Record<string, string> = {
    groceries: "🛒",
    electronics: "📱",
    furniture: "🪑",
    beauty: "💄",
    fragrances: "🌸",
    "skin-care": "🧴",
    "skin care": "🧴",
    "home-decoration": "🏠",
    "home decoration": "🏠",
    "kitchen-accessories": "🍳",
    "kitchen accessories": "🍳",
    laptops: "💻",
    "mens-shirts": "👔",
    "mens-shoes": "👞",
    "mens-watches": "⌚",
    "mobile-accessories": "🔌",
    "mobile accessories": "🔌",
    motorcycle: "🏍️",
    sports: "⚽",
    sunglasses: "🕶️",
    tablets: "📱",
    tops: "👚",
    vehicle: "🚗",
    "womens-bags": "👜",
    "womens-dresses": "👗",
    "womens-jewellery": "💍",
    "womens-shoes": "👠",
    "womens-watches": "⌚",
    "personal care": "🧴",
    "home & kitchen": "🏠",
    "food & beverages": "🍕",
    "baby care": "👶",
    "health & wellness": "💊",
    cleaning: "🧹",
    beverages: "🥤",
    snacks: "🍿",
    dairy: "🥛",
};

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [categories, setCategories] = useState<LocalizedString[]>([]);
    const [showCategories, setShowCategories] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const t = useTranslations("nav");
    const locale = useLocale();

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL;
        if (!API) return;
        fetch(`${API}/products/categories`, {
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const raw: LocalizedString[] = data.data ?? [];
                    const seen = new Set<string>();
                    setCategories(raw.filter((c) => {
                        if (seen.has(c.en)) return false;
                        seen.add(c.en);
                        return true;
                    }));
                }
            })
            .catch(() => {});
    }, []);

    const handleMouseEnter = () => {
        clearTimeout(timeoutRef.current);
        setShowCategories(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setShowCategories(false), 150);
    };

    return (
        <nav className="bg-primary relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center h-11">
                    {/* ── All Categories button with dropdown ── */}
                    <div
                        className="relative hidden lg:block shrink-0"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button
                            className={cn(
                                "flex items-center gap-2 text-primary text-sm font-medium px-5 h-9 cursor-pointer rounded-lg transition-all duration-200 bg-white hover:bg-primary-light",
                            )}
                        >
                            {/* Hamburger icon */}
                            <Menu className="w-4 h-4" />
                            {t("all_categories")}
                            {/* Chevron */}
                            <svg
                                className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-300",
                                    showCategories && "rotate-180",
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* ── Categories dropdown panel ── */}
                        <div
                            className={cn(
                                "absolute top-full left-0 w-[560px] bg-white rounded-b-xl rounded-tr-xl shadow-2xl z-50 transition-all duration-300 origin-top",
                                showCategories
                                    ? "opacity-100 scale-y-100 translate-y-0"
                                    : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none",
                            )}
                        >
                            <div className="p-5 grid grid-cols-3 gap-2 max-h-[420px] overflow-y-auto">
                                {categories.map((cat) => {
                                    const catEnName = cat.en;
                                    const displayName = getLocalized(cat, locale);
                                    return (
                                        <Link
                                            key={catEnName}
                                            href={`/category/${encodeURIComponent(catEnName)}`}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary-light transition-all duration-200 group"
                                        >
                                            <span className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200 shrink-0">
                                                {CATEGORY_ICONS[
                                                    catEnName.toLowerCase()
                                                ] ?? "📦"}
                                            </span>
                                            <span className="text-sm font-medium text-text-primary capitalize truncate group-hover:text-primary transition-colors duration-200">
                                                {displayName.replace(/-/g, " ")}
                                            </span>
                                        </Link>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <div className="col-span-3 text-center py-8 text-text-muted text-sm">
                                        Loading categories...
                                    </div>
                                )}
                            </div>
                            {/* View all link */}
                            <div className="border-t border-border px-5 py-3">
                                <Link
                                    href="/shop"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    View All Categories &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop nav links with dividers ── */}
                    <div className="hidden lg:flex items-center flex-1 justify-center">
                        {NAV_ITEMS.map(({ key, href }, index) => (
                            <div key={key} className="flex items-center">
                                {/* Divider */}
                                {index > 0 && (
                                    <div className="w-px h-4 bg-white/30" />
                                )}
                                <Link
                                    href={href}
                                    className="relative text-white text-sm font-light px-9 py-2 group flex items-center gap-1"
                                >
                                    <span className="relative">
                                        {t(key)}
                                        {/* Animated underline */}
                                        <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-white rounded-full transition-all duration-300 ease-out group-hover:w-full" />
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden text-white p-2"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>

                    {/* Mobile: All Categories link */}
                    <Link
                        href="/shop"
                        className="lg:hidden text-white text-sm font-medium"
                    >
                        {t("all_categories")}
                    </Link>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <div
                className={cn(
                    "lg:hidden border-t border-white/20 overflow-hidden transition-all duration-300",
                    mobileOpen
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0",
                )}
            >
                <div className="max-w-7xl mx-auto px-4 py-2">
                    {/* Mobile categories */}
                    {categories.length > 0 && (
                        <div className="border-b border-white/20 pb-2 mb-2">
                            <p className="text-white/60 text-xs uppercase tracking-wider px-3 py-1">
                                Categories
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                                {categories.slice(0, 6).map((cat) => {
                                    const catEnName = cat.en;
                                    const displayName = getLocalized(cat, locale);
                                    return (
                                        <Link
                                            key={catEnName}
                                            href={`/category/${encodeURIComponent(catEnName)}`}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 text-white text-sm px-3 py-2 hover:bg-primary-hover rounded-md"
                                        >
                                            <span className="text-base">
                                                {CATEGORY_ICONS[
                                                    catEnName.toLowerCase()
                                                ] ?? "📦"}
                                            </span>
                                            <span className="capitalize truncate">
                                                {displayName.replace(/-/g, " ")}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* Mobile nav links */}
                    {NAV_ITEMS.map(({ key, href }) => (
                        <Link
                            key={key}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className="block text-white text-sm px-3 py-2 hover:bg-primary-hover rounded-md transition-colors"
                        >
                            {t(key)}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
