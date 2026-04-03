import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default async function HeroBanner() {
    const t = await getTranslations("home");
    const tc = await getTranslations("common");

    // Split title at "Before" to style it separately
    const titleParts = t("hero_title").split("Before");

    return (
        <section className="relative   overflow-hidden ">
            {/* Subtle background pattern */}

            <div className="relative max-w-7xl mx-auto px-6 md:px-10">
                <div className="flex flex-col md:flex-row items-center gap-6 py-10 md:py-14 lg:py-16">
                    {/* ── Left: Text content ── */}
                    <div className="flex-1 text-center md:text-left z-10">
                        <h1 className="font-poppins text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-text-primary leading-tight tracking-tight">
                            {titleParts[0]}
                            <span className="text-primary italic">Before</span>
                            {titleParts[1]}
                        </h1>

                        <p className="mt-5 text-text-secondary text-sm md:text-base leading-relaxed max-w-md">
                            {t("hero_subtitle")}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-5 justify-center md:justify-start">
                            {/* Shop Now button */}
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-primary text-white font-medium text-sm px-7 py-3 rounded-full hover:bg-primary-hover transition-colors shadow-md shadow-primary/20"
                            >
                                {tc("shop_now")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            {/* Explore Products text link */}
                            <Link
                                href="/deals"
                                className="text-text-primary font-semibold text-sm underline underline-offset-4 decoration-2 hover:text-primary transition-colors"
                            >
                                {t("explore")}
                            </Link>
                        </div>
                    </div>

                    {/* ── Right: Banner image ── */}
                    <div className="flex-1 flex justify-center md:justify-end z-10">
                        <div className="relative w-72 h-56 sm:w-80 sm:h-64 md:w-[420px] md:h-[320px] lg:w-[480px] lg:h-[360px]">
                            <Image
                                src="/images/home-banner.png"
                                alt="Shopping experience"
                                fill
                                className="object-contain"
                                priority
                                sizes="(max-width: 768px) 320px, (max-width: 1024px) 420px, 480px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
