import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Globe, Phone, MapPin, ShoppingCart } from "lucide-react";
import { getCachedCategories } from "@/services/productService.cached";
import { getLocalized } from "@/lib/utils";
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa6";

const SOCIAL_LINKS = [
    { label: "Facebook", href: "#", letter: "f", icons: FaFacebook },
    { label: "Instagram", href: "#", letter: "in", icons: FaInstagram },
    { label: "YouTube", href: "#", letter: "yt", icons: FaYoutube },
    { label: "Twitter", href: "#", letter: "x", icons: FaTwitter },
];

export default async function Footer() {
    const t = await getTranslations("footer");
    const tn = await getTranslations("nav");

    // Fetch real categories — deduplicate by en name, show first 6
    let categoryLinks: { en: string; display: string }[] = [];
    try {
        const res = await getCachedCategories();
        const seen = new Set<string>();
        categoryLinks = (res.data ?? [])
            .filter((c) => {
                if (seen.has(c.en)) return false;
                seen.add(c.en);
                return true;
            })
            .slice(0, 6)
            .map((c) => ({
                en: c.en,
                display: getLocalized(c, "en"),
            }));
    } catch {
        // fallback — no categories
    }

    return (
        <footer className="bg-footer-bg text-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo & Tagline */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center">
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={150}
                                    height={150}
                                />
                            </div>
                        </Link>
                        <p className="text-sm text-white/70 leading-relaxed">
                            {t("tagline")}
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-2.5 mt-4">
                            {SOCIAL_LINKS.map(
                                ({ label, href, letter, icons: Icon }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        aria-label={label}
                                        className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors text-xs font-bold uppercase"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-3">
                            {t("quick_links")}
                        </h3>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li>
                                <Link
                                    href="/shop"
                                    className="hover:text-white transition-colors"
                                >
                                    {tn("shop")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/deals"
                                    className="hover:text-white transition-colors"
                                >
                                    {tn("deals")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shop?sortBy=newest"
                                    className="hover:text-white transition-colors"
                                >
                                    {tn("new_arrivals")}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/support"
                                    className="hover:text-white transition-colors"
                                >
                                    {tn("contact_us")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories — fetched from API */}
                    <div>
                        <h3 className="font-semibold mb-3">
                            {t("categories")}
                        </h3>
                        <ul className="space-y-2 text-sm text-white/70">
                            {categoryLinks.map((cat) => (
                                <li key={cat.en}>
                                    <Link
                                        href={`/category/${encodeURIComponent(cat.en)}`}
                                        className="hover:text-white transition-colors capitalize"
                                    >
                                        {cat.display
                                            .toLowerCase()
                                            .replace(/\b\w/g, (c) =>
                                                c.toUpperCase(),
                                            )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold mb-3">
                            {t("contact_info")}
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/70">
                            <li className="flex items-center gap-2">
                                <Globe className="w-4 h-4 shrink-0 text-white/50" />
                                {t("website")}
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 shrink-0 text-white/50" />
                                {t("phone")}
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 shrink-0 text-white/50" />
                                {t("location")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/15">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/60">
                    <p>{t("copyright")}</p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/terms"
                            className="hover:text-white transition-colors"
                        >
                            {t("terms")}
                        </Link>
                        <Link
                            href="/privacy"
                            className="hover:text-white transition-colors"
                        >
                            {t("privacy")}
                        </Link>
                        <Link
                            href="/refund-policy"
                            className="hover:text-white transition-colors"
                        >
                            {t("refund")}
                        </Link>
                        {/* <Link
                            href="/cookies"
                            className="hover:text-white transition-colors"
                        >
                            {t("cookies")}
                        </Link> */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
