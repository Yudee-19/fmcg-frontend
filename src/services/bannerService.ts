import apiServer from './apiServer';
import type { Banner } from '@/types';

interface LiveBannersResponse {
    success: boolean;
    code: string;
    message: string;
    total: number;
    data: Banner[];
}

/**
 * Public: GET /api/banners/live
 * Returns all PUBLISHED banners ordered by position.
 */
export async function getLiveBanners(): Promise<Banner[]> {
    try {
        const { data } = await apiServer.get<LiveBannersResponse>(
            '/banners/live',
        );
        return data?.data ?? [];
    } catch {
        // Soft-fail so the homepage can fall back to the default hero.
        return [];
    }
}
