import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import LegalPageView from "@/components/legal/LegalPageView";
import { privacyContent } from "@/content/legal/privacy";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "legal" });
    return {
        title: `${t("privacy_title")} | Crown Value Mart`,
        description: t("privacy_description"),
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/privacy`,
            languages: {
                en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/privacy`,
                ar: `${process.env.NEXT_PUBLIC_SITE_URL}/ar/privacy`,
            },
        },
    };
}

export default async function PrivacyPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("legal");

    const content = privacyContent[locale as Locale] ?? privacyContent.en;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <Breadcrumb
                items={[
                    { label: t("home"), href: `/${locale}` },
                    { label: t("privacy_title") },
                ]}
            />
            <div className="mt-4">
                <LegalPageView content={content} />
            </div>
        </div>
    );
}
