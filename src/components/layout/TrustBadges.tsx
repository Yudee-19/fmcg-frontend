import { getTranslations } from "next-intl/server";
import { Truck, ShieldCheck, RefreshCw, Tag } from "lucide-react";

const BADGE_ICONS = [Truck, ShieldCheck, RefreshCw, Tag];

const BADGE_KEYS = [
    { title: "fast_delivery", desc: "fast_delivery_desc" },
    { title: "secure_payment", desc: "secure_payment_desc" },
    { title: "easy_returns", desc: "easy_returns_desc" },
    { title: "best_deals", desc: "best_deals_desc" },
] as const;

export default async function TrustBadges() {
    const t = await getTranslations("trust");

    return (
        <section className="bg-white border-t border-border">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-border">
                    {BADGE_KEYS.map(({ title, desc }, i) => {
                        const Icon = BADGE_ICONS[i];
                        return (
                            <div
                                key={title}
                                className="flex flex-col items-center text-center gap-3 px-8 py-6 sm:py-0 flex-1"
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                    <Icon
                                        className="w-7 h-7 text-primary"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <h3 className="font-bold text-sm text-primary ">
                                    {t(title)}
                                </h3>
                                <p className="text-xs text-text-secondary max-w-45">
                                    {t(desc)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
