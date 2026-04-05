"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LocalizedString } from "@/types";
import { getLocalized } from "@/lib/utils";
import { getCategoryImage } from "@/lib/categoryImage";

export default function CategoryStrip() {
    const t = useTranslations("home");
    const tc = useTranslations("common");
    const locale = useLocale();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [categories, setCategories] = useState<LocalizedString[]>([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Fetch categories client-side
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

    // Check scroll positions
    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    useEffect(() => {
        updateScrollState();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateScrollState, { passive: true });
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", updateScrollState);
            observer.disconnect();
        };
    }, [categories]);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.querySelector("a")?.offsetWidth ?? 200;
        const gap = 16;
        const scrollAmount = (cardWidth + gap) * 2;
        el.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    if (categories.length === 0) return null;

    return (
        <section>
            {/* ── Header row ── */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-semibold text-text-primary font-poppins">
                    {t("shop_by_category")}
                </h2>
                <Link
                    href="/shop"
                    className="text-sm font-medium text-primary hover:underline underline-offset-2"
                >
                    {tc("view_all")}
                </Link>
            </div>

            {/* ── Carousel wrapper ── */}
            <div className="relative group/carousel">
                {/* Left arrow */}
                <button
                    onClick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-border rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-primary-light hover:border-primary disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5 text-text-primary" />
                </button>

                {/* Scrollable track */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide px-1 py-1"
                >
                    {categories.map((cat) => {
                        const catEnName = cat.en;
                        const displayName = getLocalized(cat, locale);
                        return (
                            <Link
                                key={catEnName}
                                href={`/category/${encodeURIComponent(catEnName)}`}
                                className="flex flex-col items-center shrink-0 group w-[140px] sm:w-[160px] md:w-[175px]"
                            >
                                {/* Image card */}
                                <div className="w-full aspect-[4/3] rounded-xl border border-border bg-white overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:border-primary/30 group-hover:-translate-y-0.5 shadow-md">
                                    <Image
                                        src={getCategoryImage(catEnName)}
                                        alt={displayName}
                                        width={300}
                                        height={200}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                </div>
                                {/* Label */}
                                <span className="mt-2.5 text-sm font-medium text-text-primary text-center capitalize leading-tight group-hover:text-primary transition-colors duration-200">
                                    {displayName.replace(/-/g, " ")}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Right arrow */}
                <button
                    onClick={() => scroll("right")}
                    disabled={!canScrollRight}
                    className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-border rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-primary-light hover:border-primary disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5 text-text-primary" />
                </button>
            </div>
        </section>
    );
}
