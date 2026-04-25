import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import { ShoppingBag, Home, Compass } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { getCachedCategories } from "@/services/productService.cached";
import { getLocalized } from "@/lib/utils";

export default async function NotFound() {
    const t = await getTranslations("not_found");
    const locale = await getLocale();

    let categories: { en: string; display: string }[] = [];
    try {
        const res = await getCachedCategories();
        const seen = new Set<string>();
        categories = (res.data ?? [])
            .filter((c) => {
                if (seen.has(c.en)) return false;
                seen.add(c.en);
                return true;
            })
            .slice(0, 6)
            .map((c) => ({
                en: c.en,
                display: getLocalized(c, locale as "en" | "ar"),
            }));
    } catch {
        // silently fall through — page still works without categories
    }

    return (
        <div className="bg-bg-page">
            <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
                {/* Big 404 with shopping bag in the middle */}
                <div className="flex items-center justify-center gap-3 sm:gap-5 mb-8">
                    <span className="text-[7rem] sm:text-[10rem] font-bold leading-none text-primary">
                        4
                    </span>
                    <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-primary-light border-4 border-primary flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 sm:w-20 sm:h-20 text-primary" />
                    </div>
                    <span className="text-[7rem] sm:text-[10rem] font-bold leading-none text-primary">
                        4
                    </span>
                </div>

                {/* Heading + description */}
                <div className="text-center max-w-xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                        {t("title")}
                    </h1>
                    <p className="text-text-secondary leading-relaxed mb-8">
                        {t("description")}
                    </p>

                    {/* Search */}
                    <div className="mb-6">
                        <SearchBar className="w-full" />
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href={`/${locale}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors w-full sm:w-auto"
                        >
                            <Home className="w-4 h-4" />
                            {t("go_home")}
                        </Link>
                        <Link
                            href={`/${locale}/shop`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary-light transition-colors w-full sm:w-auto"
                        >
                            <Compass className="w-4 h-4" />
                            {t("browse_shop")}
                        </Link>
                    </div>
                </div>

                {/* Popular categories */}
                {categories.length > 0 && (
                    <div className="mt-14 pt-10 border-t border-border">
                        <h2 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-6">
                            {t("popular_categories")}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.en}
                                    href={`/${locale}/category/${encodeURIComponent(cat.en)}`}
                                    className="px-4 py-2 rounded-full bg-bg-card border border-border text-sm text-text-primary hover:border-primary hover:text-primary transition-colors capitalize"
                                >
                                    {cat.display}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
