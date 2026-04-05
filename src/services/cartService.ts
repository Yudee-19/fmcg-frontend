'use client';

import apiClient from './apiClient';
import type { ApiResponse, Cart, CartStatsDto } from '@/types';

export async function getCart(): Promise<ApiResponse<Cart>> {
  const { data } = await apiClient.get<ApiResponse<Cart>>('/cart');
  return data;
}

export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<ApiResponse<Cart>> {
  const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/add', {
    productId,
    quantity,
  });
  return data;
}

export async function updateCartItem(
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const { data } = await apiClient.put<ApiResponse<Cart>>(
    `/cart/item/${productId}`,
    { quantity }
  );
  return data;
}

export async function removeCartItem(
  productId: string
): Promise<ApiResponse<Cart>> {
  const { data } = await apiClient.delete<ApiResponse<Cart>>(
    `/cart/item/${productId}`
  );
  return data;
}

export async function clearCartApi(): Promise<ApiResponse<null>> {
  const { data } = await apiClient.delete<ApiResponse<null>>('/cart/clear');
  return data;
}

export async function validateCart(): Promise<ApiResponse<any>> {
  const { data } = await apiClient.post<ApiResponse<any>>('/cart/validate');
  return data;
}

export async function getCartStats(): Promise<ApiResponse<CartStatsDto>> {
  const { data } = await apiClient.get<ApiResponse<CartStatsDto>>(
    '/cart/stats'
  );
  return data;
}
