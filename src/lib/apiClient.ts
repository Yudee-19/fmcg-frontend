'use client';

import { useAuthStore } from '@/store/authStore';

const API = process.env.NEXT_PUBLIC_API_URL!;

export class ApiError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

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
  if (!data.success) {
    throw new ApiError(
      data.error?.code ?? 'UNKNOWN_ERROR',
      data.error?.message ?? 'Request failed',
      res.status
    );
  }
  return data;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

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

// USR-01: Update profile with OTP verification
// Flow: 1) sendOtp(email, "profile_update", updateData) → 2) updateProfile(otp)
export const updateProfile = (otp: string) =>
  clientFetch<any>('/users/update-profile', {
    method: 'POST',
    body: JSON.stringify({ otp }),
  });

// ─── Addresses ──────────────────────────────────────────────────────────────

export const getAddresses = () => clientFetch<any>('/addresses');

export const createAddress = (payload: {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  addressType?: 'home' | 'work' | 'billing' | 'shipping';
}) =>
  clientFetch<any>('/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateAddress = (
  addressId: string,
  payload: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
    addressType?: 'home' | 'work' | 'billing' | 'shipping';
  }
) =>
  clientFetch<any>(`/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const deleteAddress = (addressId: string) =>
  clientFetch<any>(`/addresses/${addressId}`, { method: 'DELETE' });

export const setDefaultAddress = (addressId: string) =>
  clientFetch<any>(`/addresses/${addressId}/set-default`, { method: 'PATCH' });

// ─── Cart ───────────────────────────────────────────────────────────────────

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

// CRT-01: Cart statistics
export const getCartStats = () => clientFetch<any>('/cart/stats');

// ─── Wishlist ───────────────────────────────────────────────────────────────

export const getWishlist = () => clientFetch<any>('/wishlist');

export const addToWishlist = (productId: string) =>
  clientFetch<any>('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });

export const removeFromWishlist = (productId: string) =>
  clientFetch<any>(`/wishlist/item/${productId}`, { method: 'DELETE' });

// WSH-01: Clear entire wishlist
export const clearWishlist = () =>
  clientFetch<any>('/wishlist/clear', { method: 'DELETE' });

// WSH-02: Wishlist statistics
export const getWishlistStats = () => clientFetch<any>('/wishlist/stats');

// ─── Orders ─────────────────────────────────────────────────────────────────

// shippingAddress is now optional — falls back to default address from Address model
export const createOrder = (payload: {
  paymentMethod: 'ONLINE' | 'COD';
  shippingAddress?: any;
  addressId?: string;
  successUrl?: string;
  cancelUrl?: string;
}) =>
  clientFetch<any>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getOrders = (page = 1, limit = 10) =>
  clientFetch<any>(`/orders?page=${page}&limit=${limit}`);

// ORD-01: User's order statistics
export const getOrderStats = () => clientFetch<any>('/orders/stats');

export const getOrderByNumber = (orderNumber: string) =>
  clientFetch<any>(`/orders/order/${orderNumber}`);

// ORD-02: Get order by MongoDB ID
export const getOrderById = (orderId: string) =>
  clientFetch<any>(`/orders/${orderId}`);

// Cancel now supports optional reason body; auto-refunds paid online orders
export const cancelOrder = (orderId: string, reason?: string) =>
  clientFetch<any>(`/orders/${orderId}/cancel`, {
    method: 'DELETE',
    ...(reason ? { body: JSON.stringify({ reason }) } : {}),
  });

export const getPaymentHistory = (page = 1) =>
  clientFetch<any>(`/orders/payments/history?page=${page}`);

// Regenerate expired Stripe checkout URL
export const regeneratePayment = (
  orderId: string,
  successUrl: string,
  cancelUrl: string
) =>
  clientFetch<any>(`/orders/${orderId}/regenerate-payment`, {
    method: 'POST',
    body: JSON.stringify({ successUrl, cancelUrl }),
  });

// Verify delivery OTP
export const verifyDelivery = (orderId: string, otp: string) =>
  clientFetch<any>(`/orders/${orderId}/verify-delivery`, {
    method: 'POST',
    body: JSON.stringify({ otp }),
  });

// ─── Reviews ────────────────────────────────────────────────────────────────

export const createReview = (
  productId: string,
  rating: number,
  comment: string
) =>
  clientFetch<any>(`/reviews/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });

// REV-01: Get current user's own reviews
export const getUserReviews = () => clientFetch<any>('/reviews/user/reviews');

// REV-02: Update a review
export const updateReview = (
  reviewId: string,
  data: { rating?: number; comment?: string }
) =>
  clientFetch<any>(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// REV-03: Delete a review
export const deleteReview = (reviewId: string) =>
  clientFetch<any>(`/reviews/${reviewId}`, { method: 'DELETE' });

export const markReviewHelpful = (reviewId: string) =>
  clientFetch<any>(`/reviews/${reviewId}/helpful`, { method: 'POST' });

// ─── Tickets ────────────────────────────────────────────────────────────────

export const createTicket = (payload: any) =>
  clientFetch<any>('/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getTickets = () => clientFetch<any>('/tickets');

// TKT-01: Get single ticket by ID
export const getTicket = (ticketId: string) =>
  clientFetch<any>(`/tickets/${ticketId}`);

export const addTicketMessage = (ticketId: string, message: string) =>
  clientFetch<any>(`/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

// TKT-02: Close a ticket
export const closeTicket = (ticketId: string) =>
  clientFetch<any>(`/tickets/${ticketId}/close`, { method: 'PATCH' });
