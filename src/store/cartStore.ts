import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: (items: CartItem[], total: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          const newItems = existing
            ? state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              )
            : [...state.items, { ...item, addedAt: new Date().toISOString() }];
          const totalItems = newItems.reduce((s, i) => s + i.quantity, 0);
          const totalAmount = newItems.reduce(
            (s, i) => s + i.price * i.quantity,
            0
          );
          return { items: newItems, totalItems, totalAmount };
        });
      },
      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter(
            (i) => i.productId !== productId
          );
          return {
            items: newItems,
            totalItems: newItems.reduce((s, i) => s + i.quantity, 0),
            totalAmount: newItems.reduce(
              (s, i) => s + i.price * i.quantity,
              0
            ),
          };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          const newItems =
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                );
          return {
            items: newItems,
            totalItems: newItems.reduce((s, i) => s + i.quantity, 0),
            totalAmount: newItems.reduce(
              (s, i) => s + i.price * i.quantity,
              0
            ),
          };
        }),
      clearCart: () => set({ items: [], totalItems: 0, totalAmount: 0 }),
      syncWithServer: (items, total) =>
        set({
          items,
          totalItems: items.reduce((s, i) => s + i.quantity, 0),
          totalAmount: total,
        }),
    }),
    { name: 'crown-cart' }
  )
);
