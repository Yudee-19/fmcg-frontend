'use client';

import apiClient from '../apiClient';
import type { ApiResponse, Order } from '@/types';

export const getAllOrders = (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Order[]>> =>
  apiClient
    .get('/orders/admin/all', { params })
    .then((res) => res.data);

export const updateOrderStatus = (
  orderId: string,
  data: any
): Promise<ApiResponse<Order>> =>
  apiClient
    .put(`/orders/admin/${orderId}/status`, data)
    .then((res) => res.data);

export const shipOrder = (orderId: string): Promise<ApiResponse<Order>> =>
  apiClient
    .put(`/orders/admin/${orderId}/ship`)
    .then((res) => res.data);

export const refundOrder = (orderId: string): Promise<ApiResponse<any>> =>
  apiClient
    .post(`/orders/admin/${orderId}/refund`)
    .then((res) => res.data);
