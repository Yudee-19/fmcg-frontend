import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryStrip from "@/components/home/CategoryStrip";
// import TrendingProducts from '@/components/home/TrendingProducts';
import PromoCards from "@/components/home/PromoCards";
import NewArrivals from "@/components/home/NewArrivals";
import CashbackBanner from "@/components/home/CashbackBanner";

export const metadata: Metadata = {
    title: "Crown Value Mart - Shop Groceries, Electronics & More",
    description:
        "Your one-stop destination for groceries, essentials, and more at the best prices.",
};

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
            <HeroBanner />
            <CategoryStrip />
            <PromoCards />
            <NewArrivals />
            <CashbackBanner />
        </div>
    );
}
