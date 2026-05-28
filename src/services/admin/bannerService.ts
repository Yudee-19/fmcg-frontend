'use client';

import apiClient from '../apiClient';
import type { ApiResponse, Banner } from '@/types';

/**
 * Admin banner CRUD.
 * Backend base: /api/banners
 */

interface BannerListResponse {
    success: boolean;
    code: string;
    message: string;
    total?: number;
    data: Banner[];
}

export async function listBanners(): Promise<Banner[]> {
    const { data } = await apiClient.get<BannerListResponse>('/banners');
    return data?.data ?? [];
}

/**
 * Upload a new banner. The backend enforces 1920x1080 PNG/JPG.
 * Status defaults to DRAFT; position is auto-assigned at the end.
 */
export async function uploadBanner(
    file: File,
): Promise<ApiResponse<Banner>> {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await apiClient.post<ApiResponse<Banner>>(
        '/banners',
        formData,
        {
            headers: { 'Content-Type': undefined as any },
        },
    );
    return data;
}

/**
 * Toggle PUBLISHED <-> DRAFT.
 */
export async function toggleBannerStatus(
    id: string,
): Promise<ApiResponse<Banner>> {
    const { data } = await apiClient.put<ApiResponse<Banner>>(
        `/banners/${id}/status`,
    );
    return data;
}

/**
 * Update a banner's display position (integer >= 1).
 */
export async function updateBannerPosition(
    id: string,
    position: number,
): Promise<ApiResponse<Banner>> {
    const { data } = await apiClient.put<ApiResponse<Banner>>(
        `/banners/${id}/position`,
        { position },
    );
    return data;
}

export async function deleteBanner(id: string): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.delete<ApiResponse<unknown>>(
        `/banners/${id}`,
    );
    return data;
}
