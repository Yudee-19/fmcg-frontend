'use client';

import apiClient from './apiClient';
import type { ApiResponse, CategoryDto, FiltersResponse } from '@/types';

export async function getCategoriesClient(): Promise<ApiResponse<CategoryDto[]>> {
    const { data } = await apiClient.get<ApiResponse<CategoryDto[]>>(
        '/products/categories',
    );
    return data;
}

export async function getFiltersClient(): Promise<ApiResponse<FiltersResponse>> {
    const { data } = await apiClient.get<ApiResponse<FiltersResponse>>(
        '/products/filters',
    );
    return data;
}
