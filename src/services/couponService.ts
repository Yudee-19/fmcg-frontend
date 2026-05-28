'use client';
import apiClient from './apiClient';

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Customer (cart) ──────────────────────────────────────────────────────────

export async function applyCoupon(code: string) {
  const { data } = await apiClient.post('/cart/apply-coupon', { code });
  return data;
}

export async function removeCoupon() {
  const { data } = await apiClient.delete('/cart/remove-coupon');
  return data;
}

// ─── Admin types ──────────────────────────────────────────────────────────────

export type CouponStatus = 'active' | 'disabled' | 'expired' | 'exhausted' | 'scheduled';

export interface CouponListItem {
  id: string;
  code: string;
  discountPercentage: number;
  maxRedemptions: number;
  currentRedemptions: number;
  endDate: string;
  status: CouponStatus;
}

export interface CouponDashboard {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  exhaustedCoupons: number;
  totalRedemptions: number;
}

export interface CouponDetail {
  id: string;
  code: string;
  discountPercentage: number;
  maxRedemptions: number;
  currentRedemptions: number;
  remainingRedemptions: number;
  minCartAmount: number;
  maxCartAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponRedemptionUser {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string | null;
}

export interface CouponRedemption {
  id: string;
  user: CouponRedemptionUser;
  orderId: string;
  couponCode: string;
  cartAmountBeforeDiscount: number;
  discountAmount: number;
  discountPercentage: number;
  redeemedAt: string;
}

export interface CouponDetailsResponse {
  coupon: CouponDetail;
  redemptionStats: {
    totalRedemptions: number;
    totalDiscountGiven: number;
    averageCartAmount: number;
  };
  redemptions: CouponRedemption[];
}

export interface CreateCouponPayload {
  code?: string;           // optional — backend auto-generates if omitted
  discountPercentage: number;
  maxRedemptions: number;
  minCartAmount: number;
  maxCartAmount?: number | null;
  startDate: string;       // ISO
  endDate: string;         // ISO
  isActive?: boolean;
}

export type UpdateCouponPayload = Partial<CreateCouponPayload>;

// ─── Admin API calls ──────────────────────────────────────────────────────────

export async function listCoupons(params?: {
  page?: number;
  limit?: number;
  status?: CouponStatus;
  search?: string;
}): Promise<{ items: CouponListItem[]; pagination: PaginationMeta }> {
  const { data } = await apiClient.get('/coupons/admin/list', { params });
  return { items: data.data, pagination: data.pagination };
}

export async function getCouponDashboard(): Promise<CouponDashboard> {
  const { data } = await apiClient.get('/coupons/admin/dashboard');
  return data.data;
}

export async function getCouponDetails(couponId: string): Promise<CouponDetailsResponse> {
  const { data } = await apiClient.get(`/coupons/admin/${couponId}`);
  return data.data;
}

export async function createCoupon(payload: CreateCouponPayload): Promise<CouponDetail> {
  const { data } = await apiClient.post('/coupons/admin/create', payload);
  return data.data;
}

export async function updateCoupon(
  couponId: string,
  payload: UpdateCouponPayload,
): Promise<CouponDetail> {
  const { data } = await apiClient.put(`/coupons/admin/${couponId}`, payload);
  return data.data;
}

export async function deleteCoupon(couponId: string): Promise<void> {
  await apiClient.delete(`/coupons/admin/${couponId}`);
}
