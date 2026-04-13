# Crown Value Mart Frontend

Frontend for a multilingual FMCG e-commerce storefront built with Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Zustand, and next-intl. The app consumes an existing backend API and implements product browsing, cart, wishlist, authentication, checkout, orders, reviews, and profile flows.

## Current Stack

- Next.js 16.2.1
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- next-intl 4.8
- Zustand 5
- Axios
- Stripe.js

## Runtime Model

- App Router with locale-prefixed routes under `src/app/[locale]`
- Internationalization handled by `next-intl`
- Locale routing handled by `src/proxy.ts`
- Server Components used for pages and data-heavy views where possible
- Client Components used for interactive UI, Zustand access, and browser-only logic
- Backend communication split into server-safe and client-safe Axios layers

## Locales And Currency

- Supported locales: `en`, `ar`
- Default locale: `en`
- Base price currency in state and API usage: `KWD`
- Display currencies currently available: `KWD`, `USD`
- Exchange rates are refreshed from `src/app/api/exchange-rates/route.ts` and synced by `src/components/providers/RatesSync.tsx`

## Project Structure

```text
.
├── messages/                     # next-intl message catalogs
├── public/                       # static assets
├── src/
│   ├── app/
│   │   ├── api/exchange-rates/   # local API route for currency rates
│   │   ├── [locale]/             # locale-scoped app pages
│   │   ├── globals.css
│   │   ├── layout.tsx            # root layout, fonts, global metadata
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── cart/
│   │   ├── home/
│   │   ├── layout/
│   │   ├── product/
│   │   ├── providers/
│   │   ├── shop/
│   │   └── ui/
│   ├── i18n/                     # routing, request config, navigation helpers
│   ├── lib/                      # shared utilities
│   ├── services/                 # API access layer
│   ├── store/                    # Zustand stores
│   ├── types/                    # TypeScript DTOs
│   └── proxy.ts                  # locale middleware entry
├── next.config.ts
├── package.json
└── README.md
```

## App Shell

The root HTML and fonts are defined in `src/app/layout.tsx`.

The storefront shell is assembled in `src/app/[locale]/layout.tsx`:

- `NextIntlClientProvider`
- `RatesSync`
- `AuthSync`
- `AnnouncementBar`
- `Header`
- `Navbar`
- page content
- `TrustBadges`
- `Footer`

This means all localized user-facing pages share the same global commerce shell.

## Route Map

Primary user-facing routes live under `src/app/[locale]`.

| Route | Purpose | Notes |
| --- | --- | --- |
| `/:locale` | Homepage | Hero, categories, arrivals, promos, cashback |
| `/:locale/shop` | Product listing | Search, filtering, pagination |
| `/:locale/category/[category]` | Category listing | Category-specific catalog page |
| `/:locale/products/[id]` | Product detail | Metadata, JSON-LD, gallery, reviews, recommendations |
| `/:locale/cart` | Shopping cart | Uses persisted Zustand cart state |
| `/:locale/checkout` | Checkout | Address form, payment selection, Stripe/COD |
| `/:locale/order-success` | Order confirmation | Post-checkout landing page |
| `/:locale/orders` | Order history | Authenticated order list |
| `/:locale/wishlist` | Wishlist | Persisted wishlist state |
| `/:locale/profile` | Profile | Authenticated user data and addresses |
| `/:locale/support` | Support | Ticket-related UI |
| `/:locale/track-order` | Track order | Manual order lookup |
| `/:locale/deals` | Deals view | Discount-oriented listing |
| `/:locale/auth/*` | Auth flows | Login, register, verify OTP, reset password |

## Data Layer

The API layer is organized around two Axios instances.

### `src/services/apiServer.ts`

- Used from server code
- Uses `NEXT_PUBLIC_API_URL`
- Normalizes API errors into `ApiError`
- No implicit auth injection

### `src/services/apiClient.ts`

- Used from client code
- Injects `Authorization: Bearer <token>` from `authStore`
- Clears auth state on `401`
- Normalizes API errors into `ApiError`

### Domain Services

Feature services wrap the API endpoints and keep page/components thin.

- `src/services/productService.ts`: products, categories, filters, stats, reviews
- `src/services/productService.cached.ts`: cached server wrappers with `unstable_cache`
- `src/services/authService.ts`: login, register, OTP, reset password, profile
- `src/services/cartService.ts`: cart CRUD and validation
- `src/services/orderService.ts`: create order, fetch orders, cancel, payment actions
- `src/services/reviewService.ts`: create, edit, delete, helpful actions
- `src/services/wishlistService.ts`: wishlist CRUD
- `src/services/addressService.ts`: address CRUD and default address handling
- `src/services/ticketService.ts`: support tickets
- `src/services/admin/*`: admin-oriented API wrappers

## State Management

Zustand stores are in `src/store` and all major user state is persisted.

### `authStore`

- Stores user, token, and auth status
- Persisted under `crown-auth`
- Token validity is checked by `AuthSync`

### `cartStore`

- Stores cart items, item count, and total amount
- Persisted under `crown-cart`
- Supports local-first cart behavior for signed-out users

### `wishlistStore`

- Stores wishlisted items
- Persisted under `crown-wishlist`

### `preferenceStore`

- Stores selected currency and exchange rates
- Persisted under `crown-preferences`
- Formats all displayed prices from KWD base values

## Key User Flows

### Product Browsing

`src/app/[locale]/shop/page.tsx` fetches products and filter metadata on the server, then renders `ProductGrid` with `ShopFilters`.

`src/app/[locale]/products/[id]/page.tsx` fetches a product, builds localized metadata, renders JSON-LD, shows gallery/details, and loads related products plus new arrivals.

### Cart

- `ProductCard` and product detail actions push items into the persisted cart store
- Signed-out users stay fully local
- Signed-in users also call backend cart endpoints
- Cart UI is rendered through `CartTable` and `OrderSummary`

### Authentication

- Auth pages are client-driven forms
- Login stores JWT and user profile in `authStore`
- `AuthSync` validates the stored token on app load
- OTP endpoints support registration and password reset flows

### Wishlist

- Wishlist toggles update persisted local state
- Authenticated actions also sync to backend endpoints

### Checkout

`src/app/[locale]/checkout/CheckoutForm.tsx` is the main checkout client flow.

- Requires authentication
- Prefills address from the address API when possible
- Supports `COD` and `ONLINE`
- Calls `createOrder`
- Redirects to Stripe if a checkout session URL is returned
- Clears local cart after successful order creation flow

### Orders

- Order history is rendered from `OrdersList`
- Services support cancellation, payment regeneration, and delivery verification
- Tracking is available through the track-order route

### Reviews

- Product detail pages render review summaries and review lists
- Authenticated users can create and manage reviews via `reviewService`

## Localization Model

The app uses both translated UI messages and localized API data.

### UI Messages

- Stored in `messages/en.json` and `messages/ar.json`
- Loaded through `src/i18n/request.ts`
- Route helpers live in `src/i18n/navigation.ts`

### Localized API Fields

Product and category data are localized objects, not plain strings. For example:

```ts
{
	title: { en: 'Rice', ar: 'أرز' }
}
```

Helpers in `src/lib/utils.ts` resolve the active locale:

- `getLocalized()`
- `getLocalizedRecord()`

## Product And Pricing Model

The current codebase differs from the older planning docs in a few important ways.

- Product text fields are localized objects with `en` and `ar`
- Base pricing is in KWD, not INR
- Product `description` is no longer part of the primary DTO
- Final pricing is effectively handled client-side from current values and discount helpers
- Addresses are managed as separate entities instead of living directly on the user object

See `src/types/index.ts` for the current source of truth.

## SEO

SEO is implemented in the App Router layer.

- Route metadata is defined on pages
- Product detail pages generate localized metadata in `src/app/[locale]/products/[id]/page.tsx`
- Structured data is rendered by `src/components/product/ProductJsonLd.tsx`
- Sitemap is generated by `src/app/sitemap.ts`
- Robots rules are defined in `src/app/robots.ts`

## Environment Variables

Create `.env.local` with the following values:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
EXCHANGE_API_KEY=your_exchangerate_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Notes:

- `EXCHANGE_API_KEY` is optional in local development because the app falls back to static KWD/USD rates
- `NEXT_PUBLIC_SITE_URL` is used for metadata and canonical URLs

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Operational Notes

- Node 22 LTS is the safe runtime target for this repo
- The project currently has no test script configured in `package.json`
- Auth protection is mostly client-side and store-driven, not middleware-enforced
- Exchange rate refresh silently falls back to hardcoded rates if the external API is unavailable
- Several user interactions use optimistic UI without visible toast/error feedback

## File Pointers

Use these files as entry points when extending the app:

- `src/app/[locale]/layout.tsx`: storefront shell
- `src/app/[locale]/page.tsx`: homepage
- `src/app/[locale]/shop/page.tsx`: catalog flow
- `src/app/[locale]/products/[id]/page.tsx`: product detail flow
- `src/app/[locale]/checkout/CheckoutForm.tsx`: checkout behavior
- `src/services/*`: backend integration
- `src/store/*`: persisted client state
- `src/types/index.ts`: DTOs and shared types
- `src/lib/utils.ts`: localization and price helpers

## Known Gaps

Based on the current codebase state:

- Admin service wrappers exist, but there is no matching admin frontend in this repo
- Some support and tracking features appear present but thinner than the core commerce flows
- Error handling is normalized at the service layer, but user-facing feedback is still limited in several flows

## Summary

This frontend is already structured around a clear split:

- Server-rendered pages for SEO and initial data loading
- Client-side feature islands for cart, auth, wishlist, checkout, and interactive controls
- A centralized service layer for backend access
- Persisted Zustand state for user/session continuity
- Locale-aware routing and localized API content throughout the storefront
