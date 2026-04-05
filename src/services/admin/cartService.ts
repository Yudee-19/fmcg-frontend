'use client';

import apiClient from '../apiClient';
import type { ApiResponse, AdminCartUserDto, Cart } from '@/types';

export const getGuestCarts = (): Promise<ApiResponse<any>> =>
  apiClient.get('/cart/guest-carts').then((res) => res.data);

export const getCartUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<AdminCartUserDto[]>> =>
  apiClient
    .get('/cart/admin/users', { params })
    .then((res) => res.data);

export const getUserCart = (userId: string): Promise<ApiResponse<Cart>> =>
  apiClient
    .get(`/cart/admin/user/${userId}`)
    .then((res) => res.data);
