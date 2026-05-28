'use client';

import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoyaltyRates {
  amountKWD: number;       // min spend to earn (e.g. 100)
  pointsEarned: number;    // points awarded per amountKWD (e.g. 10)
  pointsRequired: number;  // points needed to redeem (e.g. 100)
  redeemableKWD: number;   // KWD discount per pointsRequired (e.g. 1)
}

export interface LoyaltyInfo {
  rates: LoyaltyRates;
  raw: {
    earning: { earning: string; description: string; whenEarned: string };
    redemption: { redemption: string; description: string; howToUse: string };
    faq: Array<{ question: string; answer: string }>;
  };
}

export interface MyPoints {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
}

export interface LoyaltyTransaction {
  type: string; // "earned" | "redeemed" | "refunded" | etc (lowercase from backend)
  points: number;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Backend /info returns formatted strings only. Parse them into raw numbers.
//   "100 KWD = 10 points"   → { amountKWD: 100, pointsEarned: 10 }
//   "100 points = 1 KWD"    → { pointsRequired: 100, redeemableKWD: 1 }
function parseRates(payload: {
  earning: { earning: string };
  redemption: { redemption: string };
}): LoyaltyRates {
  const earnMatch = payload.earning.earning.match(
    /([\d.]+)\s*KWD\s*=\s*([\d.]+)\s*points?/i,
  );
  const redeemMatch = payload.redemption.redemption.match(
    /([\d.]+)\s*points?\s*=\s*([\d.]+)\s*KWD/i,
  );

  return {
    amountKWD: earnMatch ? parseFloat(earnMatch[1]) : 100,
    pointsEarned: earnMatch ? parseFloat(earnMatch[2]) : 10,
    pointsRequired: redeemMatch ? parseFloat(redeemMatch[1]) : 100,
    redeemableKWD: redeemMatch ? parseFloat(redeemMatch[2]) : 1,
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getLoyaltyInfo(): Promise<LoyaltyInfo> {
  const { data } = await apiClient.get('/loyalty/info');
  return {
    rates: parseRates(data.data),
    raw: data.data,
  };
}

export async function getMyPoints(): Promise<MyPoints> {
  const { data } = await apiClient.get('/loyalty/my-points');
  return data.data;
}

export async function getMyHistory(
  page = 1,
  limit = 10,
): Promise<{ items: LoyaltyTransaction[]; pagination: PaginationMeta }> {
  const { data } = await apiClient.get('/loyalty/my-history', {
    params: { page, limit },
  });
  return { items: data.data, pagination: data.pagination };
}

export async function applyLoyaltyDiscount(pointsToApply: number) {
  const { data } = await apiClient.post('/cart/apply-loyalty-discount', {
    pointsToApply,
  });
  return data;
}

export async function removeLoyaltyDiscount() {
  const { data } = await apiClient.delete('/cart/remove-loyalty-discount');
  return data;
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export interface AdminConfigResponse {
  earning: { amountKWD: number; pointsEarned: number };
  redemption: { pointsRequired: number; redeemableKWD: number };
  updatedAt: string;
}

export interface AdminDashboard {
  configuration: { earning: string; redemption: string };
  systemStats: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    totalPointsOutstanding: number;
    totalCustomersWithPoints: number;
    avgPointsPerCustomer: number | string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name?: string;
  username?: string;
  email?: string;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
}

export interface CustomerLoyaltyDetails {
  wallet: {
    userId: string;
    name?: string;
    username?: string;
    email?: string;
    currentPoints: number;
    totalEarnedPoints: number;
    totalRedeemedPoints: number;
    updatedAt: string;
  };
  transactions: LoyaltyTransaction[];
}

export async function getAdminConfig(): Promise<AdminConfigResponse> {
  const { data } = await apiClient.get('/loyalty/admin/config');
  return data.data;
}

export async function updateAdminConfig(body: {
  earning: { amountKWD: number; pointsEarned: number };
  redemption: { pointsRequired: number; redeemableKWD: number };
}): Promise<AdminConfigResponse> {
  const { data } = await apiClient.post('/loyalty/admin/config', body);
  return data.data;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await apiClient.get('/loyalty/admin/dashboard');
  return data.data;
}

export async function getAdminLeaderboard(
  page = 1,
  limit = 10,
): Promise<{ items: LeaderboardEntry[]; pagination: PaginationMeta }> {
  const { data } = await apiClient.get('/loyalty/admin/leaderboard', {
    params: { page, limit },
  });
  return { items: data.data, pagination: data.pagination };
}

export async function getAdminCustomerDetails(
  userId: string,
  page = 1,
  limit = 10,
): Promise<{ details: CustomerLoyaltyDetails; pagination: PaginationMeta }> {
  const { data } = await apiClient.get(`/loyalty/admin/customer/${userId}`, {
    params: { page, limit },
  });
  return { details: data.data, pagination: data.pagination };
}

// ─── Frontend math helpers (uses rates from /info) ────────────────────────────

// How many points the user will earn AFTER delivery of an order of this amount.
export function calcPointsToEarn(orderAmount: number, rates: LoyaltyRates): number {
  if (orderAmount < rates.amountKWD) return 0;
  return Math.floor((orderAmount / rates.amountKWD) * rates.pointsEarned);
}

// KWD discount for N points (drops remainder less than a chunk).
export function pointsToKwd(points: number, rates: LoyaltyRates): number {
  const chunks = Math.floor(points / rates.pointsRequired);
  return chunks * rates.redeemableKWD;
}
