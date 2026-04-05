import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TrustBadges from "@/components/layout/TrustBadges";
import RatesSync from "@/components/providers/RatesSync";
import AuthSync from "@/components/providers/AuthSync";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <RatesSync />
            <AuthSync />
            <AnnouncementBar />
            <Header />
            <Navbar />
            <main className="flex-1">{children}</main>
            <TrustBadges />
            <Footer />
        </NextIntlClientProvider>
    );
}
