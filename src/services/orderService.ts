'use client';

import apiClient from './apiClient';
import type {
  ApiResponse,
  Order,
  OrderStatsDto,
  PaymentHistoryDto,
} from '@/types';

export const createOrder = (payload: {
  paymentMethod: 'ONLINE' | 'COD';
  shippingAddress?: any;
  addressId?: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<ApiResponse<Order> & { checkoutSession?: { id: string; url: string } }> =>
  apiClient.post('/orders', payload).then((res) => res.data);

export const getOrders = (
  page = 1,
  limit = 10
): Promise<ApiResponse<Order[]>> =>
  apiClient.get('/orders', { params: { page, limit } }).then((res) => res.data);

export const getOrderStats = (): Promise<ApiResponse<OrderStatsDto>> =>
  apiClient.get('/orders/stats').then((res) => res.data);

export const getOrderByNumber = (
  orderNumber: string
): Promise<ApiResponse<Order>> =>
  apiClient.get(`/orders/order/${orderNumber}`).then((res) => res.data);

export const getOrderById = (orderId: string): Promise<ApiResponse<Order>> =>
  apiClient.get(`/orders/${orderId}`).then((res) => res.data);

export const cancelOrder = (
  orderId: string,
  reason?: string
): Promise<ApiResponse<Order>> =>
  apiClient
    .delete(`/orders/${orderId}/cancel`, {
      ...(reason ? { data: { reason } } : {}),
    })
    .then((res) => res.data);

export const getPaymentHistory = (
  page = 1
): Promise<ApiResponse<PaymentHistoryDto[]>> =>
  apiClient
    .get('/orders/payments/history', { params: { page } })
    .then((res) => res.data);

export const regeneratePayment = (
  orderId: string,
  successUrl: string,
  cancelUrl: string
): Promise<ApiResponse<any>> =>
  apiClient
    .post(`/orders/${orderId}/regenerate-payment`, { successUrl, cancelUrl })
    .then((res) => res.data);

export const verifyDelivery = (
  orderId: string,
  otp: string
): Promise<ApiResponse<any>> =>
  apiClient
    .post(`/orders/${orderId}/verify-delivery`, { otp })
    .then((res) => res.data);
