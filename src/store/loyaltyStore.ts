'use client';
import { create } from 'zustand';
import {
  getLoyaltyInfo,
  getMyPoints,
  type LoyaltyRates,
} from '@/services/loyaltyService';

interface LoyaltyState {
  rates: LoyaltyRates | null;
  ratesLoaded: boolean;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  pointsLoaded: boolean;
  fetchRates: () => Promise<void>;
  fetchMyPoints: () => Promise<void>;
  setCurrentPoints: (n: number) => void;
  reset: () => void;
}

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
  rates: null,
  ratesLoaded: false,
  currentPoints: 0,
  totalEarned: 0,
  totalRedeemed: 0,
  pointsLoaded: false,

  fetchRates: async () => {
    if (get().ratesLoaded) return;
    try {
      const info = await getLoyaltyInfo();
      set({ rates: info.rates, ratesLoaded: true });
    } catch {
      // Fail silently — UI shows "Loading…" then hides loyalty features
    }
  },

  fetchMyPoints: async () => {
    try {
      const p = await getMyPoints();
      set({
        currentPoints: p.currentPoints,
        totalEarned: p.totalEarned,
        totalRedeemed: p.totalRedeemed,
        pointsLoaded: true,
      });
    } catch {
      set({ pointsLoaded: true });
    }
  },

  setCurrentPoints: (n) => set({ currentPoints: n }),

  reset: () =>
    set({
      currentPoints: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      pointsLoaded: false,
    }),
}));
