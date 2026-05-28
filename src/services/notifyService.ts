'use client';

import apiClient from './apiClient';
import type { ApiResponse } from '@/types';

/**
 * Subscribe the current user to a restock notification for this product.
 * Backend: POST /api/products/:productId/notify-restock (JWT required, no body).
 * The user must have a `whatsappNumber` on their profile.
 *
 * Errors surfaced by ApiClient as ApiError.code:
 *   - UNAUTHORIZED (401)
 *   - NO_WHATSAPP_NUMBER (400)
 *   - PRODUCT_IN_STOCK (400)
 *   - ALREADY_SUBSCRIBED (409)
 */
export async function subscribeRestock(
    productId: string,
): Promise<ApiResponse<unknown>> {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
        `/products/${productId}/notify-restock`,
    );
    return data;
}
