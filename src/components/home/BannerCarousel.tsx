"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";

interface BannerCarouselProps {
    banners: Banner[];
    /**
     * Auto-advance interval in ms. Set to 0 to disable.
     * @default 5000
     */
    autoAdvanceMs?: number;
}

export default function BannerCarousel({
    banners,
    autoAdvanceMs = 5000,
}: BannerCarouselProps) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const count = banners.length;

    useEffect(() => {
        if (count <= 1 || autoAdvanceMs <= 0 || paused) return;
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % count);
        }, autoAdvanceMs);
        return () => window.clearInterval(id);
    }, [count, autoAdvanceMs, paused]);

    if (count === 0) return null;

    function go(next: number) {
        setIndex(((next % count) + count) % count);
    }

    return (
        <section
            className="relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-roledescription="carousel"
        >
            {/* Aspect ratio matches the enforced 1920x1080 (16:9) so the image
                fills the slot without letterboxing on most viewports. */}
            <div className="relative w-full aspect-[16/9]">
                {banners.map((banner, i) => (
                    <div
                        key={banner._id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            i === index
                                ? "opacity-100 z-10"
                                : "opacity-0 z-0 pointer-events-none"
                        }`}
                        aria-hidden={i !== index}
                    >
                        <Image
                            src={banner.imageUrl}
                            alt=""
                            fill
                            priority={i === 0}
                            sizes="(max-width: 1280px) 100vw, 1280px"
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            {count > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => go(index - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-text-primary shadow-md backdrop-blur transition hover:bg-white"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => go(index + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-text-primary shadow-md backdrop-blur transition hover:bg-white"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                        {banners.map((banner, i) => (
                            <button
                                key={banner._id}
                                type="button"
                                onClick={() => go(i)}
                                className={`h-2 rounded-full transition-all ${
                                    i === index
                                        ? "w-6 bg-white"
                                        : "w-2 bg-white/60 hover:bg-white/80"
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                                aria-current={i === index ? "true" : undefined}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
