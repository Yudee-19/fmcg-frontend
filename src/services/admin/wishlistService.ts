'use client';

import apiClient from '../apiClient';
import type { AdminWishlistUserDto, ApiResponse, PaginationMeta, Wishlist, WishlistStatsDto } from '@/types';

export const getUserWishlist = (
  userId: string
): Promise<ApiResponse<Wishlist>> =>
  apiClient
    .get(`/wishlist/admin/user/${userId}`)
    .then((res) => res.data);

export const getUserWishlistStats = (
  userId: string
): Promise<ApiResponse<WishlistStatsDto>> =>
  apiClient
    .get(`/wishlist/admin/user/${userId}/stats`)
    .then((res) => res.data);

export const getWishlistUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<AdminWishlistUserDto[]> & { pagination?: PaginationMeta }> =>
  apiClient.get('/wishlist/admin/users', { params }).then((res) => res.data);
