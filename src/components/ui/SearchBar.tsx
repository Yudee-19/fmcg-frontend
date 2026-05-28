"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { getProductSuggestions } from "@/services/productService";

interface SearchBarProps {
    className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(-1);
    const t = useTranslations("common");
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced fetch
    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }
        const handle = setTimeout(async () => {
            try {
                const res = await getProductSuggestions(q);
                setSuggestions(res.suggestions ?? []);
                setHighlight(-1);
            } catch {
                setSuggestions([]);
            }
        }, 200);
        return () => clearTimeout(handle);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const submitSearch = (value: string) => {
        const v = value.trim();
        if (!v) return;
        setOpen(false);
        router.push(`/shop?search=${encodeURIComponent(v)}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitSearch(highlight >= 0 ? suggestions[highlight] : query);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className ?? ""}`}>
            <form onSubmit={handleSubmit}>
                <div className="flex">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("search_placeholder")}
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

            {open && suggestions.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
                    {suggestions.map((s, idx) => (
                        <li
                            key={s}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                submitSearch(s);
                            }}
                            onMouseEnter={() => setHighlight(idx)}
                            className={`px-4 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                                idx === highlight
                                    ? "bg-gray-100 text-text-primary"
                                    : "text-text-secondary hover:bg-gray-50"
                            }`}
                        >
                            <Search className="w-3.5 h-3.5 text-text-muted" />
                            <span>{s}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
