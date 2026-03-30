import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WishlistItem } from '@/types';

interface WishlistStore {
  items: WishlistItem[];
  toggle: (item: Omit<WishlistItem, 'addedAt'>) => void;
  isWishlisted: (productId: string) => boolean;
  syncWithServer: (items: WishlistItem[]) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((state) => {
          const exists = state.items.some(
            (i) => i.productId === item.productId
          );
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [
                  ...state.items,
                  { ...item, addedAt: new Date().toISOString() },
                ],
          };
        }),
      isWishlisted: (productId) =>
        get().items.some((i) => i.productId === productId),
      syncWithServer: (items) => set({ items }),
      clear: () => set({ items: [] }),
    }),
    { name: 'crown-wishlist' }
  )
);
