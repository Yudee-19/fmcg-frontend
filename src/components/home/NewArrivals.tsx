import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getNewArrivals } from "@/lib/api";
import ProductGrid from "@/components/product/ProductGrid";

export default async function NewArrivals() {
    const t = await getTranslations("home");
    const tc = await getTranslations("common");

    let products: import("@/types").Product[] = [];
    try {
        const res = await getNewArrivals();
        console.log("New Arrivals:", res.data);
        products = res.data ?? [];
    } catch {
        products = [];
    }

    if (products.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                    {t("new_arrivals")}
                </h2>
                <Link
                    href="/shop?sort=newest"
                    className="text-sm text-primary font-medium hover:underline"
                >
                    {tc("view_all")}
                </Link>
            </div>
            <ProductGrid products={products} variant="new-arrival" />
        </section>
    );
}
