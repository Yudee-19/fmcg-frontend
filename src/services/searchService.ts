'use client';

import apiClient from './apiClient';

interface SuggestionsResponse {
    success: boolean;
    suggestions: string[];
}

/**
 * Get search suggestions (autocomplete).
 * Backend: GET /api/products/suggestions?q=<query>
 * - Public endpoint (no auth required).
 * - Minimum query length is 2 characters; shorter queries return [].
 * Pass an AbortSignal to cancel a stale in-flight request from a debounced effect.
 */
export async function getSuggestions(
    query: string,
    options?: { signal?: AbortSignal },
): Promise<string[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const { data } = await apiClient.get<SuggestionsResponse>(
        '/products/suggestions',
        {
            params: { q },
            signal: options?.signal,
        },
    );
    return data?.suggestions ?? [];
}
