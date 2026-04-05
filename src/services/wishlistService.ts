'use client';

import apiClient from './apiClient';
import type { ApiResponse, WishlistStatsDto } from '@/types';

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
