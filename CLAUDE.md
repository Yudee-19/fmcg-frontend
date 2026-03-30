@AGENTS.md

# CLAUDE.md — Crown Value Mart Frontend
# Next.js 14+ E-Commerce Application

> Feed this file to Claude Code at project root as `CLAUDE.md`.
> Also attach the three design reference images:
> - CROWN_Red.jpg (homepage)
> - CROWN_PRODUCT_DETAIL_PAGE.jpg (product detail page)
> - CROWN_CART_PAGE.jpg (cart page)

---

## Project Identity

**Client:** Crown Value Mart  
**Type:** FMCG E-Commerce (groceries, electronics, household, personal care)  
**Stack:** Next.js 14+ (App Router) · TypeScript · Tailwind CSS · Zustand · next-intl  
**Backend:** Express 5 + MongoDB (already built — consume only, do not modify)  
**Base API URL:** `http://localhost:3000/api` (dev) — use `NEXT_PUBLIC_API_URL` env var  
**Design:** Refer to the three attached images at all times. Match pixel-level accuracy.

---

## Non-Negotiable Rules

1. **Never use `useEffect` + `useState` to fetch data that can be a Server Component.** Product pages, category pages, homepage sections — all Server Components by default.
2. **Never use `use client` at page level.** Pages are Server Components. Only leaf interactive components (buttons, forms, cart icons, quantity steppers) are Client Components.
3. **Always generate `metadata` and `generateMetadata` for every page.**
4. **Always add JSON-LD structured data** on product detail pages.
5. **Always use `next/image`** for every image — never raw `<img>` tags.
6. **Always store prices as INR in state/cart.** Convert to display currency only at render time via `formatPrice()`.
7. **Always use `next-intl` `useTranslations()`** for every user-visible string — never hardcode English text.
8. **Zustand stores must use `persist` middleware** for cart, wishlist, auth token, and preferences.
9. **JWT token** must be stored in Zustand + `localStorage` (via persist). Attach as `Authorization: Bearer <token>` on all authenticated API calls.
10. **Never create a page without a corresponding loading skeleton** (`loading.tsx` in the same route folder).

---

## Design System

Extracted from the provided design images. Follow these values exactly.

### Colors
```css
--color-primary: #C41E3A;          /* crimson red — buttons, badges, nav bg, links */
--color-primary-hover: #A01830;    /* darker red for hover states */
--color-primary-light: #fef2f2;    /* very light red for tag backgrounds */
--color-text-primary: #1a1a1a;
--color-text-secondary: #666666;
--color-text-muted: #999999;
--color-bg-page: #f5f5f5;
--color-bg-card: #ffffff;
--color-border: #e5e7eb;
--color-star: #f59e0b;             /* amber — star ratings */
--color-discount-badge: #C41E3A;   /* red pill — "-28%" labels */
--color-success: #16a34a;
--color-footer-bg: #C41E3A;        /* footer is full red */
```

### Typography
- Font family: Inter or Poppins (load via `next/font/google`)
- Base size: 16px
- Product card title: 14px medium
- Product price: 18-20px bold, color `--color-primary`
- Strikethrough price: 13px, color muted, `line-through`
- Section heading: 20px semibold
- Discount badge: 11px bold white on red pill

### Spacing & Corners
- Card border radius: `rounded-xl` (12px)
- Button border radius: `rounded-md` (6px) for small, `rounded-lg` (8px) for full-width
- Card padding: `p-3` or `p-4`
- Section gap: `gap-4` between product cards
- Grid: 4 columns desktop, 2 columns tablet, 1 column mobile for product grids

### Component Specs from Design Images

**Announcement Bar** (top strip, red bg, white text):
- "Enjoy Up to 50% Off on Your Favorite Products Today — Shop Now"
- Right side: location dropdown · language selector · currency selector · Customer Service link

**Header:**
- Logo: "Crown" + shopping cart icon + "Value Mart" subtitle
- Search bar: full width, placeholder "Search for groceries, electronics, brands..."
- Right icons: wishlist heart · cart with count badge · user avatar
- Nav bar (red bg): All Categories dropdown | Deals | Home | Shop | New Arrivals | Best Sellers | Track Order | Contact Us

**Product Card (two variants):**
- *Trending/Related* — discount badge top-left, wishlist heart top-right, product image, name, price (red) + original (strikethrough), quantity stepper (−/+) + "Add" button
- *New Arrivals* — "New" teal badge top-left, wishlist heart, image, name, price, "Add to Cart" full-width red button

**Product Detail Page:**
- Left: image gallery (main image + 3 thumbnails + "+4 more")
- Right: breadcrumb, title, star rating + review count, price (large red), quantity stepper, description/details tabs, Buy Now (outline) + Add to Cart (red filled) buttons, Free Delivery · 7-Day Return · Secure Payment badges
- Below: Rating & Reviews section with aggregate score + bar chart + review cards
- Below: Related Products grid
- Below: New Arrivals grid

**Cart Page:**
- Left: table with columns Product | Price | Quantity | Subtotal | Action (trash icon)
- Right sticky: Order Summary card (Items count, Subtotal, Shipping: Free, Discount, Total in bold), coupon input + Apply button, Proceed to Checkout red button
- Bottom: Continue Shopping link | Clear Shopping Cart link

**Footer (red background, white text):**
- Logo + tagline
- Quick Links: Shop, Deals, New Arrivals, Contact
- Categories: Fruits & Vegetables, Dairy & Bakery, Snacks, Household
- Contact Info: crownvaluemart.com, +91 98765 43210, West Bengal, India
- Social icons: Facebook, Instagram, YouTube, Twitter
- Copyright: © 2026 Crown Value Mart · Terms · Privacy · Cookies

---

## Project Structure

```
crown-value-mart/
├── CLAUDE.md                          ← this file
├── messages/
│   ├── en.json
│   ├── hi.json
│   └── bn.json
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx             ← NextIntlClientProvider, RatesSync, AuthSync
│   │   │   ├── page.tsx               ← Homepage (Server Component)
│   │   │   ├── loading.tsx
│   │   │   ├── shop/
│   │   │   │   ├── page.tsx           ← All products with filters
│   │   │   │   └── loading.tsx
│   │   │   ├── products/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       ← Product detail (Server Component + JSON-LD)
│   │   │   │       └── loading.tsx
│   │   │   ├── category/
│   │   │   │   └── [category]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── loading.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx           ← Client Component (reads Zustand)
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [orderNumber]/
│   │   │   │       └── page.tsx
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   ├── verify-otp/page.tsx
│   │   │   │   └── reset-password/page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   ├── order-success/
│   │   │   │   └── page.tsx
│   │   │   ├── track-order/
│   │   │   │   └── page.tsx
│   │   │   ├── support/
│   │   │   │   └── page.tsx
│   │   │   └── deals/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── exchange-rates/
│   │   │       └── route.ts           ← Proxy exchange rate API, cache 1hr
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AnnouncementBar.tsx    ← "use client" (language/currency selectors)
│   │   │   ├── Header.tsx             ← "use client" (cart count, search, user)
│   │   │   ├── Navbar.tsx             ← "use client" (categories dropdown)
│   │   │   ├── Footer.tsx             ← Server Component
│   │   │   ├── LanguageSwitcher.tsx   ← "use client"
│   │   │   └── CurrencySwitcher.tsx   ← "use client"
│   │   ├── product/
│   │   │   ├── ProductCard.tsx        ← "use client" (add to cart, wishlist)
│   │   │   ├── ProductCardSkeleton.tsx
│   │   │   ├── ProductGrid.tsx        ← Server Component
│   │   │   ├── ProductGallery.tsx     ← "use client" (image switching)
│   │   │   ├── ProductJsonLd.tsx      ← Server Component (structured data)
│   │   │   ├── QuantityStepper.tsx    ← "use client"
│   │   │   ├── AddToCartButton.tsx    ← "use client"
│   │   │   ├── WishlistButton.tsx     ← "use client"
│   │   │   ├── ReviewSection.tsx      ← Server Component
│   │   │   ├── ReviewCard.tsx         ← Server Component
│   │   │   └── RatingBar.tsx          ← Server Component
│   │   ├── cart/
│   │   │   ├── CartTable.tsx          ← "use client"
│   │   │   ├── CartItem.tsx           ← "use client"
│   │   │   └── OrderSummary.tsx       ← "use client"
│   │   ├── home/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── CategoryStrip.tsx
│   │   │   ├── TrendingProducts.tsx
│   │   │   ├── PromoCards.tsx
│   │   │   ├── NewArrivals.tsx
│   │   │   └── CashbackBanner.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── PriceDisplay.tsx       ← "use client" (reads currency store)
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx          ← "use client"
│   │   │   └── Skeleton.tsx
│   │   └── providers/
│   │       ├── RatesSync.tsx          ← "use client" (syncs live exchange rates)
│   │       └── AuthSync.tsx           ← "use client" (validates stored JWT on load)
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   ├── wishlistStore.ts
│   │   └── preferenceStore.ts
│   ├── lib/
│   │   ├── api.ts                     ← All fetch functions (server-side)
│   │   ├── apiClient.ts               ← Client-side fetch with JWT injection
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts                   ← All TypeScript interfaces matching API DTOs
│   └── i18n.ts
├── middleware.ts                       ← next-intl locale routing
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXCHANGE_API_KEY=your_exchangerate_api_key      # exchangerate-api.com free tier
NEXT_PUBLIC_SITE_URL=https://crownvaluemart.com
```

---

## TypeScript Types

Define all types in `src/types/index.ts` matching the API DTOs exactly:

```typescript
// Matches ProductResponseDto
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  barcode: string;
  itemCode: string;
  sku: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;          // computed by backend: price after discount
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  minimumOrderQuantity: number;
  warrantyInformation?: string;
  tags: string[];
  attributes?: Record<string, any>;
  thumbnail: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'billing' | 'shipping';
}

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  isActive: boolean;
  totalItems: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'ONLINE' | 'COD';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  totalItems: number;
  stripeSessionId?: string;
  deliveryOtp?: string;
  deliveredAt?: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerEmail: string;
  helpfulCount: number;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number; };
}

export interface WishlistItem {
  productId: string;
  title: string;
  price: number;
  thumbnail: string;
  addedAt: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  userId: string;
  subject: string;
  category: 'order' | 'payment' | 'delivery' | 'refund' | 'technical' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  isEscalated: boolean;
  messages: TicketMessage[];
  orderId?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  sender: string;
  senderRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  message: string;
  attachments: string[];
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

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}
```

---

## Zustand Stores

### `src/store/authStore.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'crown-auth' }
  )
);
```

### `src/store/cartStore.ts`
```typescript
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
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const newItems = existing
            ? state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                  : i
              )
            : [...state.items, { ...item, addedAt: new Date().toISOString() }];
          const totalItems = newItems.reduce((s, i) => s + i.quantity, 0);
          const totalAmount = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
          return { items: newItems, totalItems, totalAmount };
        });
      },
      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.productId !== productId);
          return {
            items: newItems,
            totalItems: newItems.reduce((s, i) => s + i.quantity, 0),
            totalAmount: newItems.reduce((s, i) => s + i.price * i.quantity, 0),
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
            totalAmount: newItems.reduce((s, i) => s + i.price * i.quantity, 0),
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
```

### `src/store/wishlistStore.ts`
```typescript
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
          const exists = state.items.some((i) => i.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((i) => i.productId !== item.productId)
              : [...state.items, { ...item, addedAt: new Date().toISOString() }],
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
```

### `src/store/preferenceStore.ts`
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee', rate: 1 },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', rate: 0.012 },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', rate: 0.0095 },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', rate: 0.011 },
  AED: { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham', rate: 0.044 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

interface PreferenceStore {
  currency: CurrencyCode;
  rates: typeof CURRENCIES;
  setCurrency: (code: CurrencyCode) => void;
  updateRates: (newRates: Record<string, number>) => void;
  formatPrice: (amountInINR: number) => string;
}

export const usePreferenceStore = create<PreferenceStore>()(
  persist(
    (set, get) => ({
      currency: 'INR',
      rates: CURRENCIES,
      setCurrency: (currency) => set({ currency }),
      updateRates: (newRates) =>
        set((state) => ({
          rates: Object.fromEntries(
            Object.entries(state.rates).map(([code, data]) => [
              code,
              { ...data, rate: newRates[code] ?? data.rate },
            ])
          ) as typeof CURRENCIES,
        })),
      formatPrice: (amountInINR) => {
        const { currency, rates } = get();
        const { symbol, rate } = rates[currency];
        const converted = amountInINR * rate;
        const formatted =
          converted < 10
            ? converted.toFixed(2)
            : converted < 1000
            ? converted.toFixed(0)
            : Math.round(converted).toLocaleString();
        return `${symbol}${formatted}`;
      },
    }),
    { name: 'crown-preferences' }
  )
);
```

---

## API Layer

### `src/lib/api.ts` — Server-side fetch (no auth, for Server Components)
```typescript
const API = process.env.NEXT_PUBLIC_API_URL!;

// Helper
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// Products
export const getProducts = (params?: {
  page?: number; limit?: number; search?: string; category?: string;
}) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/products${q ? `?${q}` : ''}`, { next: { revalidate: 300 } });
};

export const getProduct = (id: string) =>
  apiFetch(`/products/${id}`, { next: { revalidate: 300 } });

export const getCategories = () =>
  apiFetch('/products/categories', { next: { revalidate: 3600 } });

export const getFeaturedProducts = () =>
  apiFetch('/products?isFeatured=true&limit=8', { next: { revalidate: 300 } });

export const getProductReviews = (productId: string, params?: {
  page?: number; limit?: number; sort?: string;
}) => {
  const q = new URLSearchParams(params as any).toString();
  return apiFetch(`/reviews/${productId}${q ? `?${q}` : ''}`, { next: { revalidate: 60 } });
};
```

### `src/lib/apiClient.ts` — Client-side fetch (attaches JWT)
```typescript
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
  clientFetch('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (payload: any) =>
  clientFetch('/users/register', { method: 'POST', body: JSON.stringify(payload) });

export const sendOtp = (email: string, purpose: string, updateData?: any) =>
  clientFetch('/users/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose, updateData }),
  });

export const verifyOtp = (email: string, otp: string) =>
  clientFetch('/users/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) });

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  clientFetch('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });

export const logout = () => clientFetch('/users/logout', { method: 'POST' });
export const getProfile = () => clientFetch('/users/profile');

// Cart (all require JWT)
export const getCart = () => clientFetch('/cart');
export const addToCart = (productId: string, quantity = 1) =>
  clientFetch('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
export const updateCartItem = (productId: string, quantity: number) =>
  clientFetch(`/cart/item/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
export const removeCartItem = (productId: string) =>
  clientFetch(`/cart/item/${productId}`, { method: 'DELETE' });
export const clearCart = () => clientFetch('/cart/clear', { method: 'DELETE' });
export const validateCart = () => clientFetch('/cart/validate', { method: 'POST' });

// Wishlist (all require JWT)
export const getWishlist = () => clientFetch('/wishlist');
export const addToWishlist = (productId: string) =>
  clientFetch('/wishlist/add', { method: 'POST', body: JSON.stringify({ productId }) });
export const removeFromWishlist = (productId: string) =>
  clientFetch(`/wishlist/item/${productId}`, { method: 'DELETE' });

// Orders (all require JWT)
export const createOrder = (payload: {
  paymentMethod: 'ONLINE' | 'COD';
  shippingAddress: any;
  successUrl?: string;
  cancelUrl?: string;
}) => clientFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
export const getOrders = (page = 1, limit = 10) =>
  clientFetch(`/orders?page=${page}&limit=${limit}`);
export const getOrderByNumber = (orderNumber: string) =>
  clientFetch(`/orders/order/${orderNumber}`);
export const cancelOrder = (orderId: string) =>
  clientFetch(`/orders/${orderId}/cancel`, { method: 'DELETE' });
export const getPaymentHistory = (page = 1) =>
  clientFetch(`/orders/payments/history?page=${page}`);

// Reviews
export const createReview = (productId: string, rating: number, comment: string) =>
  clientFetch(`/reviews/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
export const markReviewHelpful = (reviewId: string) =>
  clientFetch(`/reviews/${reviewId}/helpful`, { method: 'POST' });

// Tickets
export const createTicket = (payload: any) =>
  clientFetch('/tickets', { method: 'POST', body: JSON.stringify(payload) });
export const getTickets = () => clientFetch('/tickets');
export const addTicketMessage = (ticketId: string, message: string) =>
  clientFetch(`/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
```

---

## i18n Setup

### `src/i18n.ts`
```typescript
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'hi', 'bn'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

### `middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'en',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### `messages/en.json` — Build this fully before starting components
```json
{
  "common": {
    "shop_now": "Shop Now",
    "view_all": "View All",
    "add_to_cart": "Add to Cart",
    "buy_now": "Buy Now",
    "new": "New",
    "free": "Free",
    "search_placeholder": "Search for groceries, electronics, brands...",
    "customer_service": "Customer Service",
    "loading": "Loading...",
    "no_results": "No results found"
  },
  "nav": {
    "all_categories": "All Categories",
    "deals": "Deals",
    "home": "Home",
    "shop": "Shop",
    "new_arrivals": "New Arrivals",
    "best_sellers": "Best Sellers",
    "track_order": "Track Order",
    "contact_us": "Contact Us"
  },
  "announcement": {
    "text": "Enjoy Up to 50% Off on Your Favorite Products Today",
    "cta": "Shop Now"
  },
  "home": {
    "hero_title": "Experience Shopping Like Never Before",
    "hero_subtitle": "Shop smarter with a wide selection, easy browsing, secure payments, and fast delivery you can trust.",
    "explore": "Explore Products",
    "shop_by_category": "Shop By Categories",
    "trending": "Trending Products",
    "new_arrivals": "New Arrivals",
    "cashback_title": "Get 15% Cashback on Your Orders You Make",
    "cashback_cta": "Get Started"
  },
  "product": {
    "in_stock": "In Stock",
    "out_of_stock": "Out of Stock",
    "free_delivery": "Free Delivery",
    "return_policy": "7-Day Return",
    "secure_payment": "Secure Payment",
    "brand": "Brand",
    "capacity": "Capacity",
    "material": "Material",
    "color": "Color",
    "weight": "Weight",
    "compartments": "Compartments",
    "closure_type": "Closure Type",
    "description": "Description",
    "details": "Details",
    "related": "Related Products",
    "reviews": "{count} reviews",
    "write_review": "Write a Review",
    "rating_title": "Rating & Reviews"
  },
  "cart": {
    "title": "Shopping Cart",
    "product": "Product",
    "price": "Price",
    "quantity": "Quantity",
    "subtotal": "Subtotal",
    "action": "Action",
    "items": "Items",
    "shipping": "Shipping",
    "discount": "Discount",
    "total": "Total",
    "order_summary": "Order Summary",
    "coupon_placeholder": "Enter coupon code",
    "apply": "Apply",
    "checkout": "Proceed to Checkout",
    "continue_shopping": "Continue Shopping",
    "clear_cart": "Clear Shopping Cart",
    "empty": "Your cart is empty",
    "empty_cta": "Start Shopping"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "confirm_password": "Confirm Password",
    "username": "Username",
    "first_name": "First Name",
    "last_name": "Last Name",
    "phone": "Phone Number",
    "otp": "OTP",
    "send_otp": "Send OTP",
    "verify_otp": "Verify OTP",
    "reset_password": "Reset Password",
    "forgot_password": "Forgot Password?"
  },
  "order": {
    "title": "My Orders",
    "number": "Order Number",
    "status": "Status",
    "date": "Date",
    "total": "Total",
    "payment_method": "Payment Method",
    "shipping_address": "Shipping Address",
    "track": "Track Order",
    "cancel": "Cancel Order",
    "pending": "Pending",
    "confirmed": "Confirmed",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled"
  },
  "footer": {
    "tagline": "Your one-stop destination for groceries, essentials, and more at the best prices.",
    "quick_links": "Quick Links",
    "categories": "Categories",
    "contact_info": "Contact Info",
    "terms": "Terms",
    "privacy": "Privacy",
    "cookies": "Cookies",
    "copyright": "© 2026 Crown Value Mart"
  },
  "trust": {
    "fast_delivery": "Fast Delivery",
    "fast_delivery_desc": "Get your orders delivered quickly and safely.",
    "secure_payment": "Secure Payment",
    "secure_payment_desc": "100% secure payment with trusted gateways.",
    "easy_returns": "Easy Returns",
    "easy_returns_desc": "Hassle-free returns within 7 days.",
    "best_deals": "Best Value Deals",
    "best_deals_desc": "Enjoy great deals and competitive pricing."
  }
}
```

Create `messages/hi.json` and `messages/bn.json` with the same keys, translated.

---

## SEO Implementation

### Every product page must have:

**1. `generateMetadata` in `app/[locale]/products/[id]/page.tsx`:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { data: product } = await getProduct(params.id);
  return {
    title: `${product.title} | Crown Value Mart`,
    description: product.description.slice(0, 160),
    keywords: [...(product.tags ?? []), product.category, product.subCategory].filter(Boolean),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: [{ url: product.thumbnail, width: 800, height: 600, alt: product.title }],
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/products/${params.id}`,
      languages: {
        en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/products/${params.id}`,
        hi: `${process.env.NEXT_PUBLIC_SITE_URL}/hi/products/${params.id}`,
        bn: `${process.env.NEXT_PUBLIC_SITE_URL}/bn/products/${params.id}`,
      },
    },
  };
}
```

**2. JSON-LD in `components/product/ProductJsonLd.tsx`:**
```typescript
export function ProductJsonLd({ product }: { product: Product }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images,
    brand: { '@type': 'Brand', name: product.attributes?.brand ?? 'Crown Value Mart' },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.finalPrice,
      priceCurrency: 'INR',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      seller: { '@type': 'Organization', name: 'Crown Value Mart' },
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**3. `app/sitemap.ts`:**
```typescript
import { getProducts } from '@/lib/api';
import { locales } from '@/i18n';

export default async function sitemap() {
  const { data: products } = await getProducts({ limit: 1000 });
  const productUrls = products.flatMap((p: any) =>
    locales.map((locale) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/products/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );
  const staticUrls = locales.flatMap((locale) => [
    { url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/shop`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/deals`, changeFrequency: 'daily' as const, priority: 0.9 },
  ]);
  return [...staticUrls, ...productUrls];
}
```

**4. `app/robots.ts`:**
```typescript
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart', '/profile', '/orders', '/checkout'] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
```

---

## API Endpoints Reference

All endpoints. Base: `NEXT_PUBLIC_API_URL` = `http://localhost:3000/api`

### Auth (no JWT)
| Method | Path | Body |
|--------|------|------|
| POST | `/users/register` | `{ username, email, password, confirmPassword, firstName?, lastName?, phoneNumber?, countryCode?, addresses? }` |
| POST | `/users/login` | `{ email, password }` → returns `{ user, token }` |
| POST | `/users/send-otp` | `{ email, purpose: "registration"\|"password_reset"\|"profile_update", updateData? }` |
| POST | `/users/verify-otp` | `{ email, otp }` |
| POST | `/users/reset-password` | `{ email, otp, newPassword }` |

### Auth (JWT required)
| Method | Path | Notes |
|--------|------|-------|
| POST | `/users/logout` | Clears session |
| GET | `/users/profile` | Returns `ProfileResponseDto` |
| POST | `/users/update-profile` | `{ otp }` — uses OTP-verified pending update |

### Products (public)
| Method | Path | Query params |
|--------|------|------|
| GET | `/products` | `page, limit, search, category` |
| GET | `/products/categories` | — |
| GET | `/products/categories/:categoryName/subcategories` | — |
| GET | `/products/filters` | — |
| GET | `/products/stats` | — |
| GET | `/products/:id` | — |

### Cart (JWT required)
| Method | Path | Body |
|--------|------|------|
| GET | `/cart` | — |
| POST | `/cart/add` | `{ productId, quantity? }` |
| PUT | `/cart/item/:productId` | `{ quantity }` |
| DELETE | `/cart/item/:productId` | — |
| DELETE | `/cart/clear` | — |
| POST | `/cart/validate` | — |

### Orders (JWT required)
| Method | Path | Body / Query |
|--------|------|------|
| POST | `/orders` | `{ paymentMethod: "ONLINE"\|"COD", shippingAddress, successUrl?, cancelUrl? }` |
| GET | `/orders` | `page, limit` |
| GET | `/orders/order/:orderNumber` | — |
| GET | `/orders/:orderId` | — |
| DELETE | `/orders/:orderId/cancel` | — |
| GET | `/orders/payments/history` | `page, limit` |

### Wishlist (JWT required)
| Method | Path | Body |
|--------|------|------|
| GET | `/wishlist` | — |
| POST | `/wishlist/add` | `{ productId }` |
| DELETE | `/wishlist/item/:productId` | — |
| DELETE | `/wishlist/clear` | — |

### Reviews
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/reviews/:productId` | JWT | `{ rating: 1-5, comment }` |
| GET | `/reviews/:productId` | optional | `page, limit, sort` |
| PUT | `/reviews/:id` | JWT | `{ rating?, comment? }` |
| DELETE | `/reviews/:id` | JWT | — |
| POST | `/reviews/:id/helpful` | none | — |

### Tickets (JWT required)
| Method | Path | Body |
|--------|------|------|
| POST | `/tickets` | `{ subject, category, priority?, message, orderId? }` |
| GET | `/tickets` | — |
| GET | `/tickets/:ticketId` | — |
| POST | `/tickets/:ticketId/messages` | `{ message }` |
| PATCH | `/tickets/:ticketId/close` | — |

---

## Common Response Shapes

```typescript
// Success
{ success: true, code: "OPERATION_CODE", message: "...", data: T }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." } }

// Paginated
{ success: true, data: T[], pagination: { currentPage, totalPages, totalRecords, recordsPerPage, hasNextPage, hasPrevPage } }

// Stripe order
{ success: true, data: OrderResponseDto, checkoutSession: { id: "cs_...", url: "https://checkout.stripe.com/..." } }
```

---

## Key Implementation Notes

### Hydration — avoid mismatch with Zustand
Any component that reads from Zustand and renders price/count must guard against SSR mismatch:
```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;
```

### Cart — server sync strategy
- Optimistic update: update Zustand immediately for fast UI
- Background sync: call backend API in parallel
- On error: revert Zustand to previous state and show toast

### Payment flow
1. User clicks "Proceed to Checkout"
2. Call `POST /orders` with `paymentMethod: "ONLINE"`
3. Response includes `checkoutSession.url`
4. Redirect to Stripe: `window.location.href = checkoutSession.url`
5. On success, Stripe redirects to `successUrl` (e.g. `/order-success?orderNumber=ORD...`)
6. On success page, fetch order by number and show confirmation

### OTP flow for registration
1. `POST /users/register` → user created but INACTIVE
2. `POST /users/send-otp` with `purpose: "registration"`
3. Redirect to `/auth/verify-otp` with email in query param
4. `POST /users/verify-otp` → account becomes ACTIVE
5. Redirect to `/auth/login`

### Server-side cart on auth
When user logs in, call `GET /cart` and `syncWithServer()` the Zustand store to merge local cart with server cart state.

---

## `next.config.ts`

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },  // AWS S3
      { protocol: 'https', hostname: 'dummyjson.com' },     // dev/seed images
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default withNextIntl(config);
```

---

## Build Order

Follow this order when building the project. Do not skip steps.

1. **Setup** — init Next.js, install deps, configure Tailwind, next.config.ts, i18n, middleware
2. **Types** — create all TypeScript interfaces in `src/types/index.ts`
3. **Stores** — create all 4 Zustand stores
4. **API layer** — create `src/lib/api.ts` and `src/lib/apiClient.ts`
5. **i18n messages** — create en.json, hi.json, bn.json fully before any component
6. **UI primitives** — Button, Badge, StarRating, PriceDisplay, Skeleton, Breadcrumb, Pagination
7. **Layout** — AnnouncementBar → Header → Navbar → Footer (match design images exactly)
8. **Homepage** — HeroBanner, CategoryStrip, TrendingProducts, PromoCards, NewArrivals, CashbackBanner
9. **Product grid + card** — ProductCard (both variants), ProductGrid, ProductCardSkeleton
10. **Product detail page** — ProductGallery, ProductJsonLd, ReviewSection, RatingBar, QuantityStepper, AddToCartButton
11. **Cart page** — CartTable, CartItem, OrderSummary
12. **Auth pages** — login, register, verify-otp, reset-password
13. **Checkout + order success** — Stripe redirect flow
14. **Orders, Wishlist, Profile pages**
15. **Support tickets page**
16. **SEO** — sitemap.ts, robots.ts, verify all generateMetadata exports
17. **Exchange rates** — `/api/exchange-rates` route + RatesSync provider

---

## Packages to Install

```bash
npm install zustand next-intl @stripe/stripe-js
npm install -D @types/node
```

---

*This CLAUDE.md was generated from the Crown Value Mart API documentation and design reference images. Every API endpoint, DTO shape, and design token documented here is authoritative. When in doubt about API response shape, refer to the DTOs section above.*

