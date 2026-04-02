# API Audit Report — Crown Value Mart Frontend

> **Date:** 2026-04-02
> **Source of truth:** `API_DOCUMENTATION.md` (backend)
> **Audited files:** `src/lib/api.ts`, `src/lib/apiClient.ts`, `src/types/index.ts`, page components

---

## Table of Contents

1. [Bugs & Mismatches in Existing Code](#1-bugs--mismatches-in-existing-code)
2. [Missing User-Facing API Functions](#2-missing-user-facing-api-functions)
3. [Missing Admin API Functions & Pages](#3-missing-admin-api-functions--pages)
4. [Type Definition Issues](#4-type-definition-issues)
5. [Summary Counts](#5-summary-counts)

---

## 1. Bugs & Mismatches in Existing Code

### BUG-01: Categories API — Wrong Response Type

**File:** `src/lib/api.ts:37`

**Current (wrong):**
```typescript
export const getCategories = () =>
  apiFetch<ApiResponse<string[]>>('/products/categories', {
    next: { revalidate: 3600 },
  });
```

**API actually returns:**
```json
{
  "success": true,
  "code": "CATEGORIES_RETRIEVED",
  "data": [
    { "name": "Electronics", "count": 42 },
    { "name": "Groceries", "count": 35 }
  ]
}
```

**Fix required:** Change type to `ApiResponse<{ name: string; count: number }[]>` and add a `CategoryDto` type to `src/types/index.ts`.

**Impact:** Any component consuming `getCategories()` expecting `string[]` will break when accessing `.name` or `.count`.

---

### BUG-02: Reviews API — Response Structure Mismatch

**File:** `src/lib/api.ts:61`

**Current (wrong):**
```typescript
return apiFetch<ApiResponse<Review[]> & { stats?: ReviewStats }>(
  `/reviews/${productId}${q ? `?${q}` : ''}`,
  { next: { revalidate: 60 } }
);
```

**API actually returns:**
```json
{
  "success": true,
  "code": "REVIEWS_RETRIEVED",
  "data": {
    "reviews": [ ...ReviewWithDetailsDto[] ],
    "pagination": {
      "current": 1,
      "total": 3,
      "limit": 10,
      "totalReviews": 25
    }
  }
}
```

**Problems:**
1. Reviews are nested inside `data.reviews`, not directly in `data`
2. Pagination shape is `{ current, total, limit, totalReviews }` — NOT the standard `PaginationMeta` shape used elsewhere
3. Stats (`averageRating`, `totalReviews`, `ratingDistribution`) are returned as part of the same response but current type doesn't reflect the nesting

**Fix required:** Create a dedicated `ReviewListResponse` type matching the actual nested structure.

**Impact:** Product detail page review section likely renders nothing or crashes.

---

### BUG-03: Register Flow — Possible Double OTP

**File:** `src/app/[locale]/auth/register/page.tsx:42-56`

**Current flow:**
```typescript
await registerApi({ ... });                    // Step 1: Register user
await sendOtp(form.email, "registration");     // Step 2: Explicitly send OTP
router.push(`/auth/verify-otp?email=...`);     // Step 3: Redirect to OTP page
```

**Problem:** The backend register endpoint response message says:
> *"User registered successfully. Please check your email for OTP verification."*

This strongly implies the backend **auto-sends** an OTP during registration. If that's the case, the explicit `sendOtp()` call on line 53 sends a **second OTP**, which **invalidates the first one**. The user receives two emails, and only the second OTP works — confusing UX.

**Fix required:** Either:
- Remove the explicit `sendOtp()` call if backend auto-sends on register, OR
- Verify with backend team that register does NOT auto-send, and the message is just instructional

---

### BUG-04: Login Response Data Access Pattern

**File:** `src/app/[locale]/auth/login/page.tsx`

**How `clientFetch` works:**
```typescript
// clientFetch returns the FULL JSON response:
// { success: true, code: "LOGIN_SUCCESS", data: { user: {...}, token: "..." } }
```

**Login page accesses:**
```typescript
const data = await loginApi(form.email, form.password);
setAuth(data.data.user, data.data.token);
```

**This is technically correct** but fragile — `data.data.user` has double `.data` because `clientFetch` returns the raw API envelope. If `clientFetch` is ever refactored to unwrap `.data`, every consumer breaks.

**Recommendation:** Either make `clientFetch` always unwrap `.data`, or type the return values explicitly so consumers know what they're getting.

---

### BUG-05: `clientFetch` Error Handling Inconsistency

**File:** `src/lib/apiClient.ts:21`

**Current:**
```typescript
if (!data.success) throw new Error(data.error?.message ?? 'Request failed');
```

**Problem:** The API error shape per documentation is:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}
```

The error `code` (e.g., `DUPLICATE_EMAIL`, `INVALID_CREDENTIALS`, `ACCOUNT_NOT_ACTIVE`) is thrown away. Frontend components have no way to show specific error handling (e.g., redirect to OTP page on `ACCOUNT_NOT_ACTIVE`, show "email taken" on `DUPLICATE_EMAIL`).

**Fix required:** Throw a custom error class that preserves both `code` and `message`:
```typescript
class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}
```

---

### BUG-06: `getNewArrivals` Uses Unsupported Query Param

**File:** `src/lib/api.ts:47`

**Current:**
```typescript
export const getNewArrivals = () =>
  apiFetch<ApiResponse<Product[]>>('/products?limit=8&sort=-createdAt', {
    next: { revalidate: 300 },
  });
```

**Problem:** The API documentation for `GET /products` only lists these query params: `page`, `limit`, `search`, `category`. There is **no `sort` parameter** documented.

**Fix required:** Verify with backend if `sort` is actually supported. If not, remove it — the backend may already return products in newest-first order by default, or this param is silently ignored.

---

## 2. Missing User-Facing API Functions

These endpoints exist in the backend and are relevant to the customer-facing frontend, but have **no corresponding function** in `src/lib/api.ts` or `src/lib/apiClient.ts`.

### AUTH / USER

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| USR-01 | POST | `/api/users/update-profile` | Update profile via OTP verification. Body: `{ otp }`. Requires prior `sendOtp(email, "profile_update", updateData)` call. | **High** — Profile page needs this |

**How it works per API docs:**
1. User edits profile fields
2. Frontend calls `sendOtp(email, "profile_update", { firstName: "New", ... })` — the `updateData` contains the pending changes
3. Backend stores `updateData` in `pendingUpdate` field and sends OTP
4. User enters OTP
5. Frontend calls `POST /users/update-profile` with `{ otp }` body
6. Backend verifies OTP, applies `pendingUpdate`, returns `UpdateProfileResponseDto`

---

### PRODUCTS

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| PRD-01 | GET | `/api/products/categories/:categoryName/subcategories` | Get subcategories for a given category | **Medium** — Useful for category page filters |
| PRD-02 | GET | `/api/products/filters` | Get all available filter options (price ranges, brands, etc.) | **Medium** — Shop page filter sidebar |
| PRD-03 | GET | `/api/products/stats` | Product statistics (total products, categories, avg price, low stock) | **Low** — Informational |
| PRD-04 | POST | `/api/products/validate-category` | Validate and normalize a category name | **Low** — Defensive use |

---

### CART

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| CRT-01 | GET | `/api/cart/stats` | Cart statistics (total carts, items, value) | **Low** — Admin-oriented but available to users |

---

### ORDERS

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| ORD-01 | GET | `/api/orders/stats` | User's order statistics (total, pending, shipped, delivered, revenue) | **Medium** — Useful for profile/orders dashboard |
| ORD-02 | GET | `/api/orders/:orderId` | Get order by MongoDB ID (currently only `order/:orderNumber` exists) | **Low** — `orderNumber` variant is usually sufficient |

---

### WISHLIST

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| WSH-01 | DELETE | `/api/wishlist/clear` | Clear entire wishlist | **Medium** — Wishlist page needs a "clear all" action |
| WSH-02 | GET | `/api/wishlist/stats` | Wishlist statistics (total items, total value) | **Low** — Nice-to-have for wishlist page header |

---

### REVIEWS

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| REV-01 | GET | `/api/reviews/user/reviews` | Get current user's own reviews (JWT required) | **Medium** — Profile page "My Reviews" section |
| REV-02 | PUT | `/api/reviews/:id` | Update an existing review (JWT required, only own reviews) | **Medium** — Edit review functionality |
| REV-03 | DELETE | `/api/reviews/:id` | Delete a review (JWT required, only own reviews) | **Medium** — Delete review functionality |

---

### TICKETS

| # | Method | Endpoint | Description | Priority |
|---|--------|----------|-------------|----------|
| TKT-01 | GET | `/api/tickets/:ticketId` | Get a single ticket by ID with full message history | **High** — Ticket detail page needs this |
| TKT-02 | PATCH | `/api/tickets/:ticketId/close` | Close a resolved ticket | **High** — User should be able to close their tickets |

---

## 3. Missing Admin API Functions & Pages

The frontend has **zero admin pages and zero admin API functions**. The backend provides a comprehensive admin API that would power an admin dashboard. Here is every missing admin endpoint:

### 3.1 User Management (requires `ADMIN` role)

| # | Method | Endpoint | Description | Request Body / Params |
|---|--------|----------|-------------|-----------------------|
| ADM-USR-01 | GET | `/api/users/` | List all users (USER role only) | Query: `page`, `limit` |
| ADM-USR-02 | GET | `/api/users/:id` | Get user details by ID | Param: `id` |
| ADM-USR-03 | PUT | `/api/users/:id` | Update a user's details | Param: `id`, Body: user fields |
| ADM-USR-04 | DELETE | `/api/users/:id` | Delete a user account | Param: `id` |

**Response shapes:**
- List: `{ success, data: UserResponseDto[], pagination: PaginationMeta }`
- Single: `{ success, data: UserResponseDto }`

---

### 3.2 Admin User Management (requires `SUPER_ADMIN` role)

| # | Method | Endpoint | Description | Request Body / Params |
|---|--------|----------|-------------|-----------------------|
| ADM-SA-01 | POST | `/api/users/admin/create` | Create a new admin user | Body: `{ username, email, password }` |
| ADM-SA-02 | GET | `/api/users/admin/list` | List all admin users | — |
| ADM-SA-03 | GET | `/api/users/admin/:id` | Get admin user by ID | Param: `id` |
| ADM-SA-04 | PUT | `/api/users/admin/:id` | Update admin user | Param: `id`, Body: admin fields |
| ADM-SA-05 | DELETE | `/api/users/admin/:id` | Delete admin user | Param: `id` |

**Create admin response:**
```json
{
  "success": true,
  "data": { "_id": "...", "username": "admin_user", "email": "...", "role": "ADMIN", "status": "ACTIVE" },
  "message": "Admin user created successfully"
}
```

---

### 3.3 Product Management (requires `ADMIN` role)

| # | Method | Endpoint | Content-Type | Description |
|---|--------|----------|--------------|-------------|
| ADM-PRD-01 | POST | `/api/products/` | `multipart/form-data` | Create product with image upload to S3 |
| ADM-PRD-02 | PUT | `/api/products/:id` | `application/json` | Update product details |
| ADM-PRD-03 | DELETE | `/api/products/:id` | — | Delete a product |
| ADM-PRD-04 | POST | `/api/products/bulk-update` | `application/json` | Bulk update multiple products |

**Create product form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | |
| `description` | string | Yes | |
| `category` | string | Yes | |
| `subCategory` | string | No | |
| `barcode` | string | Yes | Must be unique |
| `itemCode` | string | Yes | |
| `sku` | string | Yes | |
| `price` | string | Yes | Parsed as number |
| `discountPercentage` | string | No | |
| `stock` | string | No | |
| `isFeatured` | string | No | `"true"` / `"false"` |
| `minimumOrderQuantity` | string | No | |
| `warrantyInformation` | string | No | |
| `tags` | string | No | JSON array string |
| `attributes` | string | No | JSON object string |
| `images` | File[] | Yes | Uploaded to AWS S3 |

**Error codes:** `MISSING_REQUIRED_FIELD` (400), `VALIDATION_ERROR` (400), `DUPLICATE_FIELD` (409)

---

### 3.4 Product Data Management (requires `SUPER_ADMIN` role)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| ADM-PRD-SA-01 | POST | `/api/products/fetch-store` | Fetch products from external API and store in DB |
| ADM-PRD-SA-02 | POST | `/api/products/update-existing` | Update existing products from external API |
| ADM-PRD-SA-03 | POST | `/api/products/clean-data` | Clean/normalize product data in DB |

---

### 3.5 Cart Admin (requires `ADMIN` role)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| ADM-CRT-01 | GET | `/api/cart/guest-carts` | View all guest (anonymous) carts |

**Response:** `{ success, data: CartResponseDto[] }`

---

### 3.6 Order Management (requires `ADMIN` role)

| # | Method | Endpoint | Description | Request Body / Params |
|---|--------|----------|-------------|-----------------------|
| ADM-ORD-01 | GET | `/api/orders/admin/all` | Get all orders across all users | Query: `page`, `limit`, filters |
| ADM-ORD-02 | PUT | `/api/orders/admin/:orderId/status` | Update order status | Body: validated by `UpdateOrderStatusSchema` |
| ADM-ORD-03 | PUT | `/api/orders/admin/:orderId/ship` | Ship order — sends delivery OTP email to customer | Param: `orderId` |

**Ship order response:**
```json
{
  "success": true,
  "data": { ...OrderResponseDto },
  "message": "Order shipped successfully. Delivery OTP has been sent to the user."
}
```

**Order stats DTO (available from `GET /orders/stats`):**
```json
{
  "totalOrders": 15,
  "pendingOrders": 2,
  "confirmedOrders": 3,
  "shippedOrders": 5,
  "deliveredOrders": 4,
  "cancelledOrders": 1,
  "totalRevenue": 1250.00
}
```

---

### 3.7 Wishlist Admin (requires `ADMIN` role)

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| ADM-WSH-01 | GET | `/api/wishlist/admin/user/:userId` | View a specific user's wishlist |
| ADM-WSH-02 | GET | `/api/wishlist/admin/user/:userId/stats` | Get wishlist stats for a user |
| ADM-WSH-03 | GET | `/api/wishlist/admin/users` | List all users who have wishlists |

**Wishlist stats DTO:**
```json
{
  "totalItems": 5,
  "totalValue": 2499.50,
  "userDetails": { "userName": "john_doe", "userEmail": "john@example.com" }
}
```

---

### 3.8 Ticket Admin (requires `ADMIN` role)

| # | Method | Endpoint | Description | Request Body / Params |
|---|--------|----------|-------------|-----------------------|
| ADM-TKT-01 | GET | `/api/tickets/admin/all` | Get all tickets (filterable) | Query: `page`, `limit`, `status`, `category`, `priority`, `search` |
| ADM-TKT-02 | GET | `/api/tickets/admin/stats` | Get ticket statistics | — |
| ADM-TKT-03 | GET | `/api/tickets/admin/:ticketId` | View any ticket (regardless of owner) | Param: `ticketId` |
| ADM-TKT-04 | PATCH | `/api/tickets/admin/:ticketId/status` | Update ticket status | Body: validated by `UpdateTicketStatusSchema` |
| ADM-TKT-05 | PATCH | `/api/tickets/admin/:ticketId/priority` | Update ticket priority | Body: validated by `UpdateTicketPrioritySchema` |
| ADM-TKT-06 | PATCH | `/api/tickets/admin/:ticketId/escalate` | Escalate a ticket | Param: `ticketId` |
| ADM-TKT-07 | POST | `/api/tickets/admin/:ticketId/messages` | Admin reply to a ticket | Body: `{ message }` |

**Ticket stats DTO:**
```json
{
  "totalTickets": 50,
  "openTickets": 12,
  "inProgressTickets": 8,
  "resolvedTickets": 20,
  "closedTickets": 10,
  "escalatedTickets": 3
}
```

**Ticket filter params for `GET /tickets/admin/all`:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Records per page |
| `status` | string | `open`, `in_progress`, `waiting_customer`, `resolved`, `closed` |
| `category` | string | `order`, `payment`, `delivery`, `refund`, `technical`, `general` |
| `priority` | string | `low`, `medium`, `high`, `urgent` |
| `search` | string | Search in subject or ticketId |

---

## 4. Type Definition Issues

All issues in `src/types/index.ts`.

### TYPE-01: Missing `CategoryDto` type

**Add:**
```typescript
export interface CategoryDto {
  name: string;
  count: number;
}
```

---

### TYPE-02: `Ticket` interface — Missing fields

**Current:** Missing `assignedTo`, `escalationLevel`, `resolvedAt` from `TicketResponseDto`.

**Fix:**
```typescript
export interface Ticket {
  // ... existing fields ...
  assignedTo?: string;        // ADD
  escalationLevel: number;    // ADD
  resolvedAt?: string;        // ADD
}
```

---

### TYPE-03: `Review` interface — Missing populated fields

**Current:** Missing `productName`, `username`, `userEmail` from `ReviewWithDetailsDto`.

**Fix:**
```typescript
export interface Review {
  // ... existing fields ...
  productName?: string;   // ADD — populated from Product
  username?: string;       // ADD — populated from User
  userEmail?: string;      // ADD — populated from User
}
```

---

### TYPE-04: Missing `ReviewListResponse` type

The review list endpoint returns a non-standard nested structure:

**Add:**
```typescript
export interface ReviewListResponse {
  reviews: Review[];
  pagination: {
    current: number;
    total: number;
    limit: number;
    totalReviews: number;
  };
}
```

---

### TYPE-05: Missing admin-related DTOs

If admin panel is built, these types will be needed:

```typescript
export interface ProductStatsDto {
  totalProducts: number;
  totalCategories: number;
  averagePrice: number;
  lowStockProducts: number;
}

export interface OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface CartStatsDto {
  totalCarts: number;
  totalItems: number;
  totalValue: number;
}

export interface WishlistStatsDto {
  totalItems: number;
  totalValue: number;
  userDetails?: {
    userName: string;
    userEmail: string;
  };
}

export interface TicketStatsDto {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  escalatedTickets: number;
}

export interface PaymentHistoryDto {
  orderId: string;
  orderNumber: string;
  amount: number;
  status: string;
  method: string;
  date: string;
}

export interface AdminTicketDto {
  id: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isEscalated: boolean;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  createdAt: string;
}

export interface UpdateProfileResponseDto {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  updatedFields: string[];
}
```

---

### TYPE-06: Missing `Wishlist` wrapper type

The wishlist endpoint returns a full `WishlistResponseDto`, but there's no `Wishlist` interface:

```typescript
export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  isActive: boolean;
  totalItems: number;
  userDetails?: {
    userName: string;
    userEmail: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. Summary Counts

| Category | Count |
|----------|-------|
| Bugs / mismatches in existing code | **6** |
| Missing user-facing API functions | **15** |
| Missing admin API endpoints | **30** |
| Missing / incorrect TypeScript types | **6** |
| **Total issues** | **57** |

### Not needed in frontend

| Endpoint | Reason |
|----------|--------|
| `POST /api/webhooks/stripe` | Server-to-server (Stripe calls backend directly) |
| `GET /health` | Infrastructure / monitoring only |

---

*End of audit.*
