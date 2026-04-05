"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn, getLocalized } from "@/lib/utils";
import { Menu } from "lucide-react";
import Image from "next/image";
import type { LocalizedString } from "@/types";
import { getCategoryImage } from "@/lib/categoryImage";
import { getCategories } from "@/services/productService";

const NAV_ITEMS = [
    { key: "deals", href: "/deals" },
    { key: "home", href: "/" },
    { key: "shop", href: "/shop" },
    { key: "new_arrivals", href: "/shop?sort=newest" },
    { key: "best_sellers", href: "/shop?sort=popular" },
    { key: "track_order", href: "/track-order" },
    { key: "contact_us", href: "/support" },
] as const;

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [categories, setCategories] = useState<LocalizedString[]>([]);
    const [showCategories, setShowCategories] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const t = useTranslations("nav");
    const locale = useLocale();

    useEffect(() => {
        getCategories()
            .then((res) => {
                const raw: LocalizedString[] = res.data ?? [];
                const seen = new Set<string>();
                setCategories(raw.filter((c) => {
                    if (seen.has(c.en)) return false;
                    seen.add(c.en);
                    return true;
                }));
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
                    {/* ── All Categories button ── */}
                    <div
                        className="hidden lg:block shrink-0"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <button
                            className={cn(
                                "flex items-center gap-2 text-primary text-sm font-medium px-5 h-9 cursor-pointer rounded-lg transition-all duration-200 bg-white hover:bg-primary-light",
                            )}
                        >
                            <Menu className="w-4 h-4" />
                            {t("all_categories")}
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

            {/* ── Full-width categories dropdown (desktop) ── */}
            <div
                className={cn(
                    "hidden lg:block absolute top-full left-0 right-0 bg-white shadow-2xl z-50 transition-all duration-300 origin-top",
                    showCategories
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-95 pointer-events-none",
                )}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="max-w-7xl mx-auto px-4 py-5">
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => {
                            const catEnName = cat.en;
                            const displayName = getLocalized(cat, locale);
                            return (
                                <Link
                                    key={catEnName}
                                    href={`/category/${encodeURIComponent(catEnName)}`}
                                    className="flex flex-col items-center shrink-0 group w-[100px]"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-gray-50 group-hover:border-primary/40 group-hover:shadow-md transition-all duration-200">
                                        <Image
                                            src={getCategoryImage(catEnName)}
                                            alt={displayName}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="mt-1.5 text-xs font-medium text-text-primary text-center capitalize leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {displayName.replace(/-/g, " ")}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
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
                                            <Image
                                                src={getCategoryImage(catEnName)}
                                                alt={displayName}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 rounded object-cover shrink-0"
                                            />
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
