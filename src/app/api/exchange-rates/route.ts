import { NextResponse } from "next/server";

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const CACHE_TTL = 3600; // 1 hour

let cachedRates: Record<string, number> | null = null;
let cacheTimestamp = 0;

export async function GET() {
    const now = Date.now();

    // Return cached rates if still fresh
    if (cachedRates && now - cacheTimestamp < CACHE_TTL * 1000) {
        return NextResponse.json({ rates: cachedRates });
    }

    // Fallback rates in case API is unavailable
    const fallbackRates: Record<string, number> = {
        KWD: 1,
        USD: 3.26,
    };

    if (!EXCHANGE_API_KEY || EXCHANGE_API_KEY === "your_exchangerate_api_key") {
        return NextResponse.json({ rates: fallbackRates });
    }

    try {
        const res = await fetch(
            `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/KWD`,
            { next: { revalidate: CACHE_TTL } },
        );

        if (!res.ok) {
            return NextResponse.json({ rates: cachedRates ?? fallbackRates });
        }

        const data = await res.json();

        const rates: Record<string, number> = {
            KWD: 1,
            USD: data.conversion_rates?.USD ?? fallbackRates.USD,
        };

        cachedRates = rates;
        cacheTimestamp = now;

        return NextResponse.json({ rates });
    } catch {
        return NextResponse.json({ rates: cachedRates ?? fallbackRates });
    }
}
