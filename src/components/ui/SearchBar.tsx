"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
    className?: string;
    autoFocus?: boolean;
    onSubmitted?: () => void;
}

export default function SearchBar({ className, autoFocus, onSubmitted }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const t = useTranslations("common");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
            onSubmitted?.();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="flex">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("search_placeholder")}
                    autoFocus={autoFocus}
                    className="flex-1 pl-4 pr-3 py-2.5 rounded-l-lg border border-r-0 border-border bg-white text-sm text-text-primary placeholder:font-poppins placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                    type="submit"
                    className="px-4 bg-white text-primary rounded-r-lg transition-colors flex items-center justify-center"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
