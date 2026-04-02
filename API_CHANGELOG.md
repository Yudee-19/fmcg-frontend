# FMCG E-Commerce Backend - API Changelog

> Changes since the initial documentation (`API_DOCUMENTATION.md`).
> This document lists **new features, modified schemas, new endpoints, and breaking changes**.

---

## Table of Contents

1. [Summary of Changes](#summary-of-changes)
2. [New Entity: Address](#new-entity-address)
3. [Breaking Change: Product Multilingual Support](#breaking-change-product-multilingual-support)
4. [Order Model: Refund System & Session Expiry](#order-model-refund-system--session-expiry)
5. [New & Modified API Endpoints](#new--modified-api-endpoints)
   - [Address Routes (NEW)](#address-routes-new)
   - [Product Routes (MODIFIED)](#product-routes-modified)
   - [Order Routes (MODIFIED)](#order-routes-modified)
   - [Cart Routes (MODIFIED)](#cart-routes-modified)
   - [User Routes (MODIFIED)](#user-routes-modified)
6. [New & Modified DTOs](#new--modified-dtos)
7. [Updated Validation Schemas](#updated-validation-schemas)
8. [New Script: seedProducts](#new-script-seedproducts)
9. [New Dependency: xlsx](#new-dependency-xlsx)

---

## Summary of Changes

| Area                  | What Changed                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| **New Entity**        | `Address` — standalone address management, separated from User model         |
| **Product Model**     | **BREAKING** — all text fields converted to `MultiLang` (`{ en, ar }`)       |
| **Order Model**       | Added refund tracking fields, session expiry, cancellation reasons            |
| **Product Routes**    | New `GET /all-filters`, `POST /bulk-create`; removed `description` field     |
| **Order Routes**      | New `POST /admin/:orderId/refund`, `POST /:orderId/regenerate-payment`       |
| **Cart Routes**       | New `GET /admin/users`, `GET /admin/user/:userId`                            |
| **User Profile**      | `getProfile` now returns structured `{ user, addresses }` from Address model |
| **Product Validator** | Flat multilingual fields (`titleEn`, `titleAr`, etc.) for form-data          |
| **Product DTO**       | New `ProductListDto` (flattened English-only), `MultiLangDto`                |
| **Cart DTO**          | New `AdminCartUserDto` for admin cart listings                               |
| **User DTO**          | New `ProfileUserDto`, `ProfileAddressDto` for restructured profile response  |
| **Seed Script**       | `seedProducts.ts` — seeds products from Excel + S3 image upload             |
| **Dependencies**      | Added `xlsx ^0.18.5`                                                         |

---

## New Entity: Address

A new standalone `Address` entity has been added, decoupled from the `User` model. Addresses are now managed via their own CRUD endpoints.

**Model:** `Address` | **Collection:** `addresses`

```typescript
interface IAddress {
  _id: ObjectId;
  userId: string;              // references User._id
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;          // default: false
  addressType: "home" | "work" | "billing" | "shipping";  // default: "home"
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:** `userId`

**DTO:**

```typescript
class AddressResponseDto extends BaseDto {
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: string;
}
```

### Address Routes

**Base:** `/api/addresses`

All endpoints require JWT authentication.

| # | Method | Endpoint                     | Auth | Validation          | Description              |
|---|--------|------------------------------|------|---------------------|--------------------------|
| 1 | GET    | `/`                          | JWT  | -                   | Get all user addresses   |
| 2 | POST   | `/`                          | JWT  | CreateAddressSchema | Create new address       |
| 3 | PUT    | `/:addressId`                | JWT  | UpdateAddressSchema | Update address           |
| 4 | DELETE | `/:addressId`                | JWT  | -                   | Delete address           |
| 5 | PATCH  | `/:addressId/set-default`    | JWT  | -                   | Set as default address   |

#### POST `/api/addresses/`

**Request Body:**
```json
{
  "street": "123 Main St",
  "city": "Riyadh",
  "state": "Riyadh Province",
  "postalCode": "12345",
  "country": "SA",
  "isDefault": true,
  "addressType": "home"
}
```

**Response (201):**
```json
{
  "success": true,
  "code": "ADDRESS_CREATED",
  "message": "Address created successfully",
  "data": { ...AddressResponseDto }
}
```

#### PUT `/api/addresses/:addressId`

All fields are optional in the update. Ownership is verified server-side.

**Response (200):**
```json
{
  "success": true,
  "code": "ADDRESS_UPDATED",
  "message": "Address updated successfully",
  "data": { ...AddressResponseDto }
}
```

#### PATCH `/api/addresses/:addressId/set-default`

Unsets all other addresses as default, then sets the target address. Returns `403` if the address doesn't belong to the user.

**Response (200):**
```json
{
  "success": true,
  "code": "DEFAULT_ADDRESS_SET",
  "message": "Default address set successfully",
  "data": { ...AddressResponseDto }
}
```

#### Error Codes

| Code                   | Status | Description                      |
| ---------------------- | ------ | -------------------------------- |
| `UNAUTHORIZED`         | 401    | No valid JWT token               |
| `FORBIDDEN`            | 403    | Address belongs to another user  |
| `ADDRESS_NOT_FOUND`    | 404    | Address ID doesn't exist         |
| `CREATE_ADDRESS_ERROR` | 500    | Server error during creation     |
| `UPDATE_ADDRESS_ERROR` | 500    | Server error during update       |
| `DELETE_ADDRESS_ERROR` | 500    | Server error during deletion     |
| `SET_DEFAULT_ERROR`    | 500    | Server error setting default     |

### Validation Schemas

```typescript
// CreateAddressSchema
{
  street: string;          // required, min 1
  city: string;            // required, min 1
  state: string;           // required, min 1
  postalCode: string;      // required, min 1
  country: string;         // required, min 1
  isDefault?: boolean;     // default: false
  addressType?: "home" | "work" | "billing" | "shipping";  // default: "home"
}

// UpdateAddressSchema — all fields optional
{
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  addressType?: "home" | "work" | "billing" | "shipping";
}
```

---

## Breaking Change: Product Multilingual Support

The `Product` model has been refactored to support **English + Arabic** bilingual content via a `MultiLang` interface.

### MultiLang Interface

```typescript
interface MultiLang {
  en: string;
  ar: string;
}
```

### Changed Fields

| Field (Before)          | Field (After)                    | Type Change                |
| ----------------------- | -------------------------------- | -------------------------- |
| `title: string`         | `title: MultiLang`               | string -> `{ en, ar }`    |
| `description: string`   | **REMOVED**                      | Field removed entirely     |
| `category: string`      | `category: MultiLang`            | string -> `{ en, ar }`    |
| `subCategory?: string`  | `subCategory?: MultiLang`        | string -> `{ en, ar }`    |
| `warrantyInformation?: string` | `warrantyInformation?: MultiLang` | string -> `{ en, ar }` |
| `attributes?: Record<string, any>` | `attributes?: { en: Record<string, any>; ar: Record<string, any> }` | Bilingual attributes |
| *(not present)*         | `searchKeywords?: string[]`      | **NEW** — text search index |

### New Product Indexes

```
{ 'category.en': 1, 'subCategory.en': 1 }   // compound
{ barcode: 1 }                                // single
{ 'title.en': 'text', searchKeywords: 'text' } // text search index (NEW)
```

### Product images validation relaxed

- **Before:** `images` required at least 1 image
- **After:** `images` defaults to `[]` (no longer required)

### Updated Product Response DTO

```typescript
class ProductResponseDto extends BaseDto {
  title: MultiLangDto;              // was: string
  category: MultiLangDto;           // was: string
  subCategory?: MultiLangDto;       // was: string
  barcode: string;
  itemCode: string;
  sku: string;
  price: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  minimumOrderQuantity: number;
  warrantyInformation?: MultiLangDto; // was: string
  tags: string[];
  attributes?: { en: Record<string, any>; ar: Record<string, any> }; // was: Record<string, any>
  thumbnail: string;
  images: string[];
  searchKeywords?: string[];        // NEW
  finalPrice: number;               // computed (unchanged)
}
```

### NEW: ProductListDto (Flattened English-Only)

A lighter DTO used in list views and recommendations, extracting only the English text:

```typescript
class ProductListDto extends BaseDto {
  title: string;              // from title.en
  category: string;           // from category.en
  subCategory: string;        // from subCategory.en
  price: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stock: number;
  thumbnail: string;
  isFeatured: boolean;
  finalPrice: number;         // computed
}
```

### Updated Product Create Validator (Form-Data)

Multilingual fields are now sent as flat form-data fields:

```typescript
// CreateProductSchema (form-data)
{
  titleEn: string;         // required
  titleAr: string;         // required
  categoryEn: string;      // required
  categoryAr: string;      // required
  subCategoryEn?: string;
  subCategoryAr?: string;
  barcode: string;         // required
  itemCode: string;        // required
  sku: string;             // required
  price: number;           // required
  discountPercentage?: number;
  stock?: number;
  isFeatured?: boolean;    // "true"/"false" string
  minimumOrderQuantity?: number;
  warrantyEn?: string;
  warrantyAr?: string;
  tags?: string | string[];
  searchKeywords?: string | string[];  // NEW
  attributes?: string | { en: Record<string,any>; ar: Record<string,any> };
  // images handled by multer
}
```

### NEW: Bulk Create Schema (JSON Body)

New endpoint for creating multiple products in a single request (without image upload):

```typescript
// BulkCreateSchema
{
  products: Array<{
    title: { en: string; ar: string };        // required
    category: { en: string; ar: string };     // required
    subCategory: { en: string; ar: string };  // required
    barcode: string;                          // required
    itemCode: string;                         // required
    sku: string;                              // required
    price: number;                            // required
    stock: number;                            // required
    tags: string[];                           // required, min 1
    searchKeywords: string[];                 // required, min 1
    discountPercentage?: number;              // 0-100
    rating?: number;                          // 0-5
    reviewCount?: number;
    isFeatured?: boolean;
    minimumOrderQuantity?: number;            // min 1
    warrantyInformation?: { en: string; ar: string };
    attributes?: { en: Record<string,any>; ar: Record<string,any> };
  }>;  // min 1 product
}
```

### Updated Product Update Validator (Form-Data)

All fields optional, with multilingual pair enforcement:

```typescript
// UpdateProductSchema
{
  titleEn?: string;
  titleAr?: string;         // required if titleEn is set
  categoryEn?: string;
  categoryAr?: string;      // required if categoryEn is set
  subCategoryEn?: string;
  subCategoryAr?: string;
  warrantyEn?: string;
  warrantyAr?: string;
  price?: number;
  discountPercentage?: number;  // 0-100
  stock?: number;
  minimumOrderQuantity?: number;
  isFeatured?: boolean;
  tags?: string | string[];
  searchKeywords?: string | string[];
  attributes?: string | { en: Record<string,any>; ar: Record<string,any> };
  imgmap?: number[] | string;   // NEW — image position reordering indices
  delimg?: number[] | string;   // NEW — image deletion indices
}
```

> **imgmap/delimg**: When updating a product, `delimg` specifies which existing image indices to delete, and `imgmap` specifies the new ordering of images after deletion and new uploads.

---

## Order Model: Refund System & Session Expiry

### New Fields on Order

| Field                | Type                                              | Description                       |
| -------------------- | ------------------------------------------------- | --------------------------------- |
| `sessionExpiresAt`   | `Date?`                                           | When Stripe session expires       |
| `cancellationReason` | `string?`                                         | Reason for order cancellation     |
| `refundStatus`       | `"NONE" \| "REQUESTED" \| "INITIATED" \| "COMPLETED" \| "FAILED"` | Refund lifecycle status  |
| `refundId`           | `string?`                                         | Stripe refund ID                  |
| `refundAmount`       | `number?`                                         | Amount refunded                   |
| `refundedAt`         | `Date?`                                           | When refund was processed         |

### Changed paymentStatus Enum

```
Before: "PENDING" | "PAID"
After:  "PENDING" | "PROCESSING" | "PAID" | "REFUNDED"
```

### Updated Order Interface

```typescript
interface Order {
  // ... existing fields unchanged ...
  paymentStatus: "PENDING" | "PROCESSING" | "PAID" | "REFUNDED";  // expanded
  sessionExpiresAt?: Date;        // NEW
  cancellationReason?: string;    // NEW
  refundStatus: "NONE" | "REQUESTED" | "INITIATED" | "COMPLETED" | "FAILED";  // NEW, default: "NONE"
  refundId?: string;              // NEW
  refundAmount?: number;          // NEW
  refundedAt?: Date;              // NEW
}
```

### Updated CreateOrderSchema

```typescript
// shippingAddress is now optional (uses default address from Address model)
{
  shippingAddress?: {             // was: required
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "ONLINE" | "COD";
  successUrl?: string;
  cancelUrl?: string;
  addressId?: string;             // NEW — specify which address to use
}
```

---

## New & Modified API Endpoints

### Address Routes (NEW)

See [New Entity: Address](#new-entity-address) above for full details.

**Base:** `/api/addresses` (registered in `server.ts`)

---

### Product Routes (MODIFIED)

**New Endpoints:**

| Method | Endpoint       | Auth      | Validation       | Description                                    |
| ------ | -------------- | --------- | ---------------- | ---------------------------------------------- |
| GET    | `/all-filters` | No        | -                | Get all filter options with values              |
| POST   | `/bulk-create` | JWT+ADMIN | BulkCreateSchema | Bulk create products without images (JSON body) |

#### GET `/api/products/all-filters`

Returns aggregated filter data including distinct categories, subcategories, tags, price ranges.

**Response (200):**
```json
{
  "success": true,
  "code": "FILTERS_RETRIEVED",
  "message": "All filters retrieved successfully",
  "data": {
    "categories": [...],
    "subCategories": [...],
    "tags": [...],
    "priceRange": { "min": 0, "max": 999 },
    "ratings": [1, 2, 3, 4, 5]
  }
}
```

#### POST `/api/products/bulk-create`

**Request Body:**
```json
{
  "products": [
    {
      "title": { "en": "Product Name", "ar": "اسم المنتج" },
      "category": { "en": "Electronics", "ar": "إلكترونيات" },
      "subCategory": { "en": "Phones", "ar": "هواتف" },
      "barcode": "1234567890",
      "itemCode": "ELEC-001",
      "sku": "E-P-001-7890",
      "price": 299.99,
      "stock": 50,
      "tags": ["phone", "electronics"],
      "searchKeywords": ["smartphone", "mobile"]
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "code": "PRODUCTS_BULK_CREATED",
  "message": "Bulk create completed: X created, Y failed",
  "data": {
    "created": 5,
    "failed": 0,
    "errors": []
  }
}
```

#### Product Listing Enhancements

`GET /api/products/` now supports additional query params:

| Param        | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `search`     | string | Text search (uses text index on title.en + searchKeywords) |
| `category`   | string | Single or comma-separated categories          |
| `minPrice`   | number | Filter by minimum price                       |
| `maxPrice`   | number | Filter by maximum price                       |
| `minRating`  | number | Filter by minimum rating                      |
| `tags`       | string | Comma-separated tag filter                    |
| `sort`       | string | Sort field (e.g., "price", "-price", "rating")|

#### Product Detail Enhancement

`GET /api/products/:id` now returns **recommendations** alongside the product:

```json
{
  "success": true,
  "code": "PRODUCT_RETRIEVED",
  "message": "Product retrieved successfully",
  "data": {
    "product": { ...ProductResponseDto },
    "recommendations": [ ...ProductListDto[] ]
  }
}
```

---

### Order Routes (MODIFIED)

**New Endpoints:**

| Method | Endpoint                          | Auth      | Description                                |
| ------ | --------------------------------- | --------- | ------------------------------------------ |
| POST   | `/admin/:orderId/refund`          | JWT+ADMIN | Initiate refund for a paid order           |
| POST   | `/:orderId/regenerate-payment`    | JWT       | Regenerate expired Stripe checkout URL     |
| POST   | `/:orderId/verify-delivery`       | JWT       | Verify delivery OTP (was PUT, now POST)    |

**Changed Endpoints:**

| Endpoint                       | Change                                                    |
| ------------------------------ | --------------------------------------------------------- |
| `POST /` (create order)       | `shippingAddress` now optional; uses Address model default; supports `addressId` |
| `DELETE /:orderId/cancel`      | Now supports `cancellationReason` in body; triggers Stripe refund for paid orders |

#### POST `/api/orders/admin/:orderId/refund`

Admin-initiated refund for a paid order.

**Response (200):**
```json
{
  "success": true,
  "code": "REFUND_INITIATED",
  "message": "Refund initiated successfully",
  "data": { ...OrderResponseDto }
}
```

**Error Codes:** `ORDER_NOT_FOUND` (404), `REFUND_NOT_ELIGIBLE` (400)

#### POST `/api/orders/:orderId/regenerate-payment`

Regenerates a Stripe checkout URL for orders with expired payment sessions.

**Request Body:**
```json
{
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "PAYMENT_URL_REGENERATED",
  "message": "Payment URL regenerated successfully",
  "data": { ...OrderResponseDto },
  "checkoutSession": {
    "id": "cs_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

#### DELETE `/api/orders/:orderId/cancel` (Enhanced)

**Request Body (optional):**
```json
{
  "reason": "Changed my mind"
}
```

Now automatically initiates a Stripe refund if the order was paid online.

---

### Cart Routes (MODIFIED)

**New Endpoints:**

| Method | Endpoint                | Auth      | Description                             |
| ------ | ----------------------- | --------- | --------------------------------------- |
| GET    | `/admin/users`          | JWT+ADMIN | Get all users with their carts          |
| GET    | `/admin/user/:userId`   | JWT+ADMIN | Get specific user's cart                |

#### GET `/api/cart/admin/users`

Paginated list of all users who have carts. Supports search.

**Query Params:** `page`, `limit`, `search`

**Response (200):**
```json
{
  "success": true,
  "code": "ALL_CARTS_RETRIEVED",
  "message": "All user carts retrieved successfully",
  "data": [
    {
      "id": "...",
      "user": { "name": "John", "email": "john@example.com", "phone": "123..." },
      "totalAmount": 149.99,
      "totalItems": 3
    }
  ],
  "pagination": { ...PaginationMetadata }
}
```

#### GET `/api/cart/admin/user/:userId`

**Response (200):**
```json
{
  "success": true,
  "code": "USER_CART_RETRIEVED",
  "message": "User cart retrieved successfully",
  "data": { ...CartResponseDto }
}
```

### New Cart DTO: AdminCartUserDto

```typescript
class AdminCartUserDto {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  totalAmount: number;
  totalItems: number;
}
```

---

### User Routes (MODIFIED)

#### GET `/api/users/profile` (Response Changed)

The profile endpoint now returns a structured response with user info and addresses from the separate `Address` model:

**New Response (200):**
```json
{
  "success": true,
  "code": "PROFILE_RETRIEVED",
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "addresses": [
      {
        "id": "...",
        "street": "123 Main St",
        "city": "Riyadh",
        "state": "Riyadh Province",
        "postalCode": "12345",
        "country": "SA",
        "type": "home",
        "isDefault": true
      }
    ]
  }
}
```

### New User DTOs

```typescript
// Profile user block — replaces the old flat ProfileResponseDto
class ProfileUserDto extends BaseDto {
  name: string;           // computed from username or firstName+lastName
  email: string;
  phone: string | null;   // null if not set
}

// Profile address block — uses Address model
class ProfileAddressDto {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: string;           // addressType
  isDefault: boolean;
}
```

---

## Updated Validation Schemas

### CreateOrderSchema

```typescript
// Before
{
  shippingAddress: { ... };   // REQUIRED
  paymentMethod: "ONLINE" | "COD";
  successUrl?: string;
  cancelUrl?: string;
}

// After
{
  shippingAddress?: { ... };  // NOW OPTIONAL (falls back to default address)
  paymentMethod: "ONLINE" | "COD";
  successUrl?: string;
  cancelUrl?: string;
  addressId?: string;         // NEW — specify address from Address model
}
```

### CreateProductSchema

See [Updated Product Create Validator](#updated-product-create-validator-form-data) in the Product section above.

### UpdateProductSchema

See [Updated Product Update Validator](#updated-product-update-validator-form-data) in the Product section above. Key additions: `imgmap`, `delimg` for image management.

### BulkCreateSchema (NEW)

See [Bulk Create Schema](#new-bulk-create-schema-json-body) in the Product section above.

---

## New Script: seedProducts

**Command:** `npm run seed-products`

Seeds products from an Excel spreadsheet (`.xlsx`) with the following workflow:
1. Reads product data from Excel file
2. Maps columns: Serial No, Barcode, Item Code, Description (EN), Description (AR), Selling Price, Category (EN), Category (AR), Sub-Category (EN), Sub-Category (AR)
3. Auto-generates SKU from `CATEGORY_ABBR-SUBCATEGORY_ABBR-ITEMCODE-LAST4BARCODE`
4. Uploads product images from local `ECOM/{serialNo}/` folders to AWS S3
5. Creates products in MongoDB, skipping duplicates by barcode

---

## New Dependency: xlsx

| Package | Version  | Purpose                                      |
| ------- | -------- | -------------------------------------------- |
| `xlsx`  | ^0.18.5  | Parse Excel files for product seed script    |

---

## Complete Endpoint Summary (Updated)

### New Endpoints Added

| Method | Full Path                                | Auth         | Description                          |
| ------ | ---------------------------------------- | ------------ | ------------------------------------ |
| GET    | `/api/addresses/`                        | JWT          | Get user's addresses                 |
| POST   | `/api/addresses/`                        | JWT          | Create address                       |
| PUT    | `/api/addresses/:addressId`              | JWT          | Update address                       |
| DELETE | `/api/addresses/:addressId`              | JWT          | Delete address                       |
| PATCH  | `/api/addresses/:addressId/set-default`  | JWT          | Set default address                  |
| GET    | `/api/products/all-filters`              | Public       | Get all filter options with values   |
| POST   | `/api/products/bulk-create`              | JWT+ADMIN    | Bulk create products (JSON)          |
| POST   | `/api/orders/admin/:orderId/refund`      | JWT+ADMIN    | Initiate refund                      |
| POST   | `/api/orders/:orderId/regenerate-payment`| JWT          | Regenerate Stripe checkout URL       |
| POST   | `/api/orders/:orderId/verify-delivery`   | JWT          | Verify delivery OTP                  |
| GET    | `/api/cart/admin/users`                  | JWT+ADMIN    | List all user carts                  |
| GET    | `/api/cart/admin/user/:userId`           | JWT+ADMIN    | Get user's cart by user ID           |

### Modified Endpoints

| Method | Full Path                         | Change Summary                                                |
| ------ | --------------------------------- | ------------------------------------------------------------- |
| POST   | `/api/orders/`                    | `shippingAddress` optional; uses Address model; `addressId` param |
| DELETE | `/api/orders/:orderId/cancel`     | Supports `reason`; auto-refunds paid online orders            |
| GET    | `/api/users/profile`              | Response restructured to `{ user: ProfileUserDto, addresses: ProfileAddressDto[] }` |
| POST   | `/api/products/`                  | Multilingual form fields (`titleEn`, `titleAr`, etc.)         |
| PUT    | `/api/products/:id`               | Multilingual fields + `imgmap`/`delimg` for image management  |
| GET    | `/api/products/:id`               | Returns `{ product, recommendations }` with ProductListDto    |
| GET    | `/api/products/`                  | Additional filters: `minPrice`, `maxPrice`, `minRating`, `tags`, `sort` |

---

*Generated by comparing the current codebase against `API_DOCUMENTATION.md`.*
