import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: {
        default: "Crown Value Mart",
        template: "%s | Crown Value Mart",
    },
    description:
        "Your one-stop destination for groceries, essentials, and more at the best prices.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            suppressHydrationWarning
            className={`${inter.variable} ${poppins.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col font-sans">
                {children}
            </body>
        </html>
    );
}
