"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { getLocalized, cn } from "@/lib/utils";
import { X, SlidersHorizontal, Star } from "lucide-react";
import type { FilterCategoryDto } from "@/types";

interface ShopFiltersProps {
    filters: {
        categories: FilterCategoryDto[];
        priceRange: { min: number; max: number };
        ratingRange?: { min: number; max: number };
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
    const currentMinRating = searchParams.get("minRating") || "";
    const currentTagsParam = searchParams.get("tags") || "";
    const currentIsFeatured = searchParams.get("isFeatured") === "true";
    const currentInStock = searchParams.get("inStock") === "true";
    const currentSort = searchParams.get("sortBy") || "";

    const selectedTags = currentTagsParam
        ? currentTagsParam.split(",").filter(Boolean)
        : [];

    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
    const [mobileOpen, setMobileOpen] = useState(false);

    const categories = filters?.categories ?? [];
    const seen = new Set<string>();
    const uniqueCategories = categories.filter((c) => {
        if (seen.has(c.en)) return false;
        seen.add(c.en);
        return true;
    });

    const availableTags = filters?.tags ?? [];

    function updateParams(updates: Record<string, string | null>) {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        params.delete("page");
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

    function handleRatingClick(rating: number) {
        const value = currentMinRating === String(rating) ? null : String(rating);
        updateParams({ minRating: value });
    }

    function handleTagToggle(tag: string) {
        const next = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag];
        updateParams({ tags: next.length > 0 ? next.join(",") : null });
    }

    function handleFeaturedToggle() {
        updateParams({ isFeatured: currentIsFeatured ? null : "true" });
    }

    function handleInStockToggle() {
        updateParams({ inStock: currentInStock ? null : "true" });
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
        !!currentMinRating ||
        selectedTags.length > 0 ||
        currentIsFeatured ||
        currentInStock ||
        !!currentSort;

    const filterContent = (
        <div className="space-y-6">
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

            {/* Quick toggles */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={currentIsFeatured}
                        onChange={handleFeaturedToggle}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {t("featured_only")}
                </label>
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={currentInStock}
                        onChange={handleInStockToggle}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {t("in_stock_only")}
                </label>
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

            {/* Minimum rating */}
            <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                    {t("min_rating")}
                </h4>
                <div className="space-y-1">
                    {[4, 3, 2, 1].map((rating) => {
                        const isActive = currentMinRating === String(rating);
                        return (
                            <button
                                key={rating}
                                onClick={() => handleRatingClick(rating)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                    isActive
                                        ? "bg-primary/5 text-primary font-semibold"
                                        : "text-text-primary hover:bg-gray-50",
                                )}
                            >
                                <span className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "h-3.5 w-3.5",
                                                i < rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300",
                                            )}
                                        />
                                    ))}
                                </span>
                                <span>{t("rating_and_up", { rating })}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tags */}
            {availableTags.length > 0 && (
                <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                        {t("tags")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {availableTags.map((tag) => {
                            const isActive = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleTagToggle(tag)}
                                    className={cn(
                                        "rounded-full border px-3 py-1 text-xs transition-colors",
                                        isActive
                                            ? "border-primary bg-primary text-white"
                                            : "border-border bg-white text-text-primary hover:border-primary/40",
                                    )}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
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

            <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-20 bg-white border border-border rounded-xl p-4">
                    {filterContent}
                </div>
            </aside>

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
