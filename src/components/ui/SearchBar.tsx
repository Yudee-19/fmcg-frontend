"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Search } from "lucide-react";
import axios from "axios";
import { getSuggestions } from "@/services/searchService";

interface SearchBarProps {
    className?: string;
    autoFocus?: boolean;
    onSubmitted?: () => void;
}

const DEBOUNCE_MS = 250;

export default function SearchBar({
    className,
    autoFocus,
    onSubmitted,
}: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const t = useTranslations("common");
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced suggestion fetch
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await getSuggestions(trimmed, {
                    signal: controller.signal,
                });
                setSuggestions(results);
                setActiveIndex(-1);
            } catch (err) {
                if (axios.isCancel(err)) return;
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function navigate(value: string) {
        const trimmed = value.trim();
        if (!trimmed) return;
        router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
        setOpen(false);
        onSubmitted?.();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
            navigate(suggestions[activeIndex]);
        } else {
            navigate(query);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (!open || suggestions.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) =>
                i <= 0 ? suggestions.length - 1 : i - 1,
            );
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    const showDropdown =
        open && query.trim().length >= 2 && (loading || suggestions.length > 0);

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
                        autoFocus={autoFocus}
                        autoComplete="off"
                        className="flex-1 pl-4 pr-3 py-2.5 rounded-l-lg border border-r-0 border-border bg-white text-sm text-text-primary placeholder:font-poppins placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="px-4 bg-white text-primary rounded-r-lg transition-colors flex items-center justify-center"
                        aria-label={t("search_placeholder")}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </form>

            {showDropdown && (
                <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-lg border border-border bg-white shadow-lg"
                >
                    {loading && suggestions.length === 0 ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-muted">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>{t("loading")}</span>
                        </div>
                    ) : (
                        suggestions.map((suggestion, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <button
                                    key={`${suggestion}-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        navigate(suggestion);
                                    }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                                        isActive
                                            ? "bg-primary-light text-primary"
                                            : "text-text-primary hover:bg-gray-50"
                                    }`}
                                >
                                    <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                                    <span className="truncate">
                                        {suggestion}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
