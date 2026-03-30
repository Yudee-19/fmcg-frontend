'use client';

import { useAuthStore } from '@/store/authStore';

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function clientFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
  return data;
}

// Auth
export const login = (email: string, password: string) =>
  clientFetch<any>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (payload: any) =>
  clientFetch<any>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const sendOtp = (email: string, purpose: string, updateData?: any) =>
  clientFetch<any>('/users/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose, updateData }),
  });

export const verifyOtp = (email: string, otp: string) =>
  clientFetch<any>('/users/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });

export const resetPassword = (
  email: string,
  otp: string,
  newPassword: string
) =>
  clientFetch<any>('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });

export const logout = () =>
  clientFetch<any>('/users/logout', { method: 'POST' });
export const getProfile = () => clientFetch<any>('/users/profile');

// Cart
export const getCart = () => clientFetch<any>('/cart');
export const addToCart = (productId: string, quantity = 1) =>
  clientFetch<any>('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
export const updateCartItem = (productId: string, quantity: number) =>
  clientFetch<any>(`/cart/item/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
export const removeCartItem = (productId: string) =>
  clientFetch<any>(`/cart/item/${productId}`, { method: 'DELETE' });
export const clearCartApi = () =>
  clientFetch<any>('/cart/clear', { method: 'DELETE' });
export const validateCart = () =>
  clientFetch<any>('/cart/validate', { method: 'POST' });

// Wishlist
export const getWishlist = () => clientFetch<any>('/wishlist');
export const addToWishlist = (productId: string) =>
  clientFetch<any>('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
export const removeFromWishlist = (productId: string) =>
  clientFetch<any>(`/wishlist/item/${productId}`, { method: 'DELETE' });

// Orders
export const createOrder = (payload: {
  paymentMethod: 'ONLINE' | 'COD';
  shippingAddress: any;
  successUrl?: string;
  cancelUrl?: string;
}) =>
  clientFetch<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const getOrders = (page = 1, limit = 10) =>
  clientFetch<any>(`/orders?page=${page}&limit=${limit}`);
export const getOrderByNumber = (orderNumber: string) =>
  clientFetch<any>(`/orders/order/${orderNumber}`);
export const cancelOrder = (orderId: string) =>
  clientFetch<any>(`/orders/${orderId}/cancel`, { method: 'DELETE' });
export const getPaymentHistory = (page = 1) =>
  clientFetch<any>(`/orders/payments/history?page=${page}`);

// Reviews
export const createReview = (
  productId: string,
  rating: number,
  comment: string
) =>
  clientFetch<any>(`/reviews/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
export const markReviewHelpful = (reviewId: string) =>
  clientFetch<any>(`/reviews/${reviewId}/helpful`, { method: 'POST' });

// Tickets
export const createTicket = (payload: any) =>
  clientFetch<any>('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const getTickets = () => clientFetch<any>('/tickets');
export const addTicketMessage = (ticketId: string, message: string) =>
  clientFetch<any>(`/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
