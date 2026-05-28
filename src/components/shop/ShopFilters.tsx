"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { getLocalized, cn } from "@/lib/utils";
import { X, SlidersHorizontal } from "lucide-react";
import type { FilterCategoryDto } from "@/types";

interface ShopFiltersProps {
    filters: {
        categories: FilterCategoryDto[];
        priceRange: { min: number; max: number };
        tags: string[];
    } | null;
}

export default function ShopFilters({ filters }: ShopFiltersProps) {
    const t = useTranslations("shop");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get("category") || "";
    const currentMinPrice = searchParams.get("minPrice") || "";
    const currentMaxPrice = searchParams.get("maxPrice") || "";
    const currentSort = searchParams.get("sortBy") || "";

    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Deduplicate categories by en name
    const categories = filters?.categories ?? [];
    const seen = new Set<string>();
    const uniqueCategories = categories.filter((c) => {
        if (seen.has(c.en)) return false;
        seen.add(c.en);
        return true;
    });

    function updateParams(updates: Record<string, string | null>) {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        params.delete("page"); // reset to page 1 on filter change
        router.push(`${pathname}?${params.toString()}`);
    }

    function handleCategoryClick(catEn: string) {
        // Picking a category is a new browse intent — drop the prior search
        // query so users don't end up with empty result sets like
        // "BABY CARE matching GARNIER VITAMIN C FACE WASH".
        updateParams({
            category: currentCategory === catEn ? null : catEn,
            search: null,
        });
    }

    function handlePriceApply() {
        updateParams({
            minPrice: minPrice || null,
            maxPrice: maxPrice || null,
        });
    }

    function handleSortChange(sortBy: string) {
        updateParams({ sortBy: sortBy || null });
    }

    function handleClearAll() {
        router.push(pathname);
    }

    const hasActiveFilters =
        !!currentCategory ||
        !!currentMinPrice ||
        !!currentMaxPrice ||
        !!currentSort;

    const filterContent = (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    {t("filters")}
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-primary hover:underline"
                    >
                        {t("clear_filters")}
                    </button>
                )}
            </div>

            {/* Sort */}
            <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    {t("sort_by")}
                </label>
                <select
                    value={currentSort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="newest">{t("sort_newest")}</option>
                    <option value="price_asc">{t("sort_price_low")}</option>
                    <option value="price_desc">{t("sort_price_high")}</option>
                    <option value="rating_desc">{t("sort_rating")}</option>
                </select>
            </div>

            {/* Categories */}
            {uniqueCategories.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                        {t("categories")}
                    </h4>
                    <div className="space-y-0.5">
                        {uniqueCategories.map((cat) => {
                            const catEn = cat.en;
                            const catDisplay = getLocalized(cat, locale);
                            const isActive = currentCategory === catEn;

                            return (
                                <button
                                    key={catEn}
                                    onClick={() => handleCategoryClick(catEn)}
                                    className={cn(
                                        "block w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors",
                                        isActive
                                            ? "text-primary font-semibold bg-primary/5"
                                            : "text-text-primary hover:bg-gray-50",
                                    )}
                                >
                                    {catDisplay}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Price Range */}
            {filters?.priceRange && (
                <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                        {t("price_range")}
                    </h4>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder={t("min_price")}
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            step="0.01"
                            min={0}
                            className="flex-1 text-sm border border-border rounded-lg px-2.5 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary w-0"
                        />
                        <span className="text-text-muted text-xs">—</span>
                        <input
                            type="number"
                            placeholder={t("max_price")}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            step="0.01"
                            min={0}
                            className="flex-1 text-sm border border-border rounded-lg px-2.5 py-1.5 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary w-0"
                        />
                        <button
                            onClick={handlePriceApply}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors shrink-0"
                        >
                            {t("apply_filters")}
                        </button>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">
                        {filters.priceRange.min.toFixed(2)} —{" "}
                        {filters.priceRange.max.toFixed(2)} KWD
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile filter toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-primary hover:bg-gray-50 transition-colors"
            >
                <SlidersHorizontal className="w-4 h-4" />
                {t("filters")}
                {hasActiveFilters && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                )}
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-20 bg-white border border-border rounded-xl p-4">
                    {filterContent}
                </div>
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="font-semibold text-text-primary">
                                {t("filters")}
                            </h2>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="p-1 text-text-muted hover:text-text-primary"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">{filterContent}</div>
                    </div>
                </div>
            )}
        </>
    );
}
