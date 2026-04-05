'use client';

import apiClient from '../apiClient';
import type { ApiResponse, WishlistStatsDto } from '@/types';

export const getUserWishlist = (
  userId: string
): Promise<ApiResponse<any>> =>
  apiClient
    .get(`/wishlist/admin/user/${userId}`)
    .then((res) => res.data);

export const getUserWishlistStats = (
  userId: string
): Promise<ApiResponse<WishlistStatsDto>> =>
  apiClient
    .get(`/wishlist/admin/user/${userId}/stats`)
    .then((res) => res.data);

export const getWishlistUsers = (): Promise<ApiResponse<any>> =>
  apiClient.get('/wishlist/admin/users').then((res) => res.data);
