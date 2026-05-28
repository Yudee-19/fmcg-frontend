'use client';

import apiClient from './apiClient';
import type { ApiResponse, WishlistItem, WishlistStatsDto } from '@/types';

export const getWishlist = (): Promise<ApiResponse<any>> =>
  apiClient.get('/wishlist').then((res) => res.data);

export const addToWishlist = (
  productId: string
): Promise<ApiResponse<any>> =>
  apiClient.post('/wishlist/add', { productId }).then((res) => res.data);

export const removeFromWishlist = (
  productId: string
): Promise<ApiResponse<any>> =>
  apiClient.delete(`/wishlist/item/${productId}`).then((res) => res.data);

export const clearWishlist = (): Promise<ApiResponse<any>> =>
  apiClient.delete('/wishlist/clear').then((res) => res.data);

export const getWishlistStats = (): Promise<ApiResponse<WishlistStatsDto>> =>
  apiClient.get('/wishlist/stats').then((res) => res.data);

// Push any anonymous (local) wishlist items to the server, then return the
// authoritative server-side list. Used on login + on app boot.
export async function mergeAndFetchWishlist(
  localItems: WishlistItem[]
): Promise<WishlistItem[]> {
  const serverRes = await getWishlist();
  const serverItems: WishlistItem[] = serverRes.data?.items ?? [];
  const serverIds = new Set(serverItems.map((i) => i.productId));
  const missing = localItems.filter((i) => !serverIds.has(i.productId));

  if (missing.length > 0) {
    await Promise.allSettled(missing.map((i) => addToWishlist(i.productId)));
    const refreshed = await getWishlist();
    return refreshed.data?.items ?? [];
  }
  return serverItems;
}
