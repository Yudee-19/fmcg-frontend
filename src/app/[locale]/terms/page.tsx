import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import LegalPageView from "@/components/legal/LegalPageView";
import { termsContent } from "@/content/legal/terms";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "legal" });
    return {
        title: `${t("terms_title")} | Crown Value Mart`,
        description: t("terms_description"),
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/terms`,
            languages: {
                en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/terms`,
                ar: `${process.env.NEXT_PUBLIC_SITE_URL}/ar/terms`,
            },
        },
    };
}

export default async function TermsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("legal");

    const content = termsContent[locale as Locale] ?? termsContent.en;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <Breadcrumb
                items={[
                    { label: t("home"), href: `/${locale}` },
                    { label: t("terms_title") },
                ]}
            />
            <div className="mt-4">
                <LegalPageView content={content} />
            </div>
        </div>
    );
}
