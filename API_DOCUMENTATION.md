# FMCG E-Commerce Backend - API Documentation

> **E-commerce Backend API** - Shopify-like platform
> **Version:** 1.0.0
> **Base URL:** `http://localhost:3000/api`
> **Runtime:** Node.js >= 16.0.0 | Express 5 | MongoDB (Mongoose 9)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Response Format](#common-response-format)
4. [Entities & Schemas](#entities--schemas)
   - [User](#user)
   - [Product](#product)
   - [Cart](#cart)
   - [Order](#order)
   - [Wishlist](#wishlist)
   - [Review](#review)
   - [Ticket](#ticket)
5. [Enums](#enums)
6. [DTOs (Response Interfaces)](#dtos-response-interfaces)
7. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [User Routes](#user-routes)
   - [Admin Routes](#admin-routes)
   - [Product Routes](#product-routes)
   - [Cart Routes](#cart-routes)
   - [Order Routes](#order-routes)
   - [Wishlist Routes](#wishlist-routes)
   - [Review Routes](#review-routes)
   - [Ticket Routes](#ticket-routes)
   - [Webhook Routes](#webhook-routes)
8. [Pagination](#pagination)
9. [Environment Variables](#environment-variables)

---

## Overview

This is a full-featured e-commerce backend providing:

- **User Management** - Registration, login, OTP verification, profile management
- **Product Catalog** - CRUD, search, categories, image uploads (AWS S3)
- **Shopping Cart** - Add/remove/update items, validation
- **Orders** - Checkout, Stripe payments, COD, delivery OTP verification
- **Wishlist** - Save products for later
- **Reviews** - Product review & rating system
- **Support Tickets** - Customer support with messaging
- **Webhooks** - Stripe payment webhook handling

### Tech Stack

| Component       | Technology                         |
| --------------- | ---------------------------------- |
| Runtime         | Node.js + TypeScript               |
| Framework       | Express 5                          |
| Database        | MongoDB (Mongoose 9)               |
| Authentication  | JWT (jsonwebtoken)                 |
| Validation      | Zod                                |
| Payments        | Stripe                             |
| File Storage    | AWS S3                             |
| Email           | Nodemailer                         |
| Serialization   | class-transformer                  |

---

## Authentication

Authentication is JWT-based via the `Authorization` header.

```
Authorization: Bearer <jwt_token>
```

### Roles

| Role           | Description                                     |
| -------------- | ----------------------------------------------- |
| `USER`         | Regular customer                                |
| `ADMIN`        | Administrative access to manage users/orders    |
| `SUPER_ADMIN`  | Full access including admin user management     |

### Middleware

| Middleware           | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `authenticateToken`  | Requires valid JWT token                             |
| `optionalAuth`       | Attempts JWT validation, continues as guest if none  |
| `requireUser`        | Requires `USER` role                                 |
| `requireAdmin`       | Requires `ADMIN` or `SUPER_ADMIN` role               |
| `requireSuperAdmin`  | Requires `SUPER_ADMIN` role                          |
| `rateLimiter`        | Rate limiting (configurable per route)               |
| `validate(schema)`   | Zod schema validation on request body                |

---

## Common Response Format

### Success Response

```json
{
  "success": true,
  "code": "OPERATION_CODE",
  "message": "Human-readable message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "code": "...",
  "message": "...",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 50,
    "recordsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Entities & Schemas

### User

**Model:** `User` | **Collection:** `users`

```typescript
interface IUser {
  _id: ObjectId;
  username: string;           // unique
  email: string;              // unique
  password: string;           // bcrypt hashed
  status: UserStatus;         // "ACTIVE" | "INACTIVE"
  role: UserRole;             // "USER" | "ADMIN" | "SUPER_ADMIN"
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  addresses?: Address[];
  customerData?: CustomerData;
  otp?: string;
  otpExpires?: Date;
  pendingUpdate?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
  addressType?: "home" | "work" | "billing" | "shipping";
}

interface CustomerData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  landlineNumber?: string;
  countryCode: string;
  address: Address;
  submittedAt: Date;
}
```

**Indexes:** `username` (unique), `email` (unique)

---

### Product

**Model:** `Product` | **Collection:** `products`

```typescript
interface Product {
  _id: ObjectId;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  barcode: string;              // unique
  itemCode: string;
  sku: string;
  price: number;
  discountPercentage: number;   // default: 0
  rating: number;               // default: 0
  reviewCount: number;          // default: 0
  stock: number;                // default: 0
  isFeatured: boolean;          // default: false
  minimumOrderQuantity: number; // default: 1
  warrantyInformation?: string;
  tags?: string[];
  images: string[];             // at least 1 required
  thumbnail?: string;
  attributes?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:** `category`, `subCategory`, `barcode` (unique), `{ category, subCategory }` compound

---

### Cart

**Model:** `Cart` | **Collection:** `carts`

```typescript
interface Cart {
  _id: ObjectId;
  userId?: string | null;   // null for guest carts
  items: CartItem[];
  totalAmount: number;       // default: 0
  totalItems: number;        // default: 0
  isActive: boolean;         // default: true
  createdAt: Date;
  updatedAt: Date;
}

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;          // min: 1
  thumbnail?: string;
  addedAt: Date;
}
```

**Indexes:** `{ userId, isActive }` compound

---

### Order

**Model:** `Order` | **Collection:** `orders`

```typescript
interface Order {
  _id: ObjectId;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "ONLINE" | "COD";
  paymentStatus: "PENDING" | "PAID";
  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  sessionId?: string;          // Stripe Checkout Session ID
  transactionId?: string;      // Payment tracking
  orderNumber: string;         // unique, auto-generated "ORD{timestamp}{random}"
  deliveryOtp?: string;        // OTP for delivery confirmation
  deliveryOtpExpires?: Date;   // OTP expiration (24 hours)
  paidAt?: Date;
  isActive: boolean;           // default: true
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;       // min: 1
  thumbnail?: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}
```

**Indexes:** `{ userId, isActive }`, `orderStatus`, `paymentStatus`, `orderNumber` (unique)

---

### Wishlist

**Model:** `Wishlist` | **Collection:** `wishlists`

```typescript
interface Wishlist {
  _id: ObjectId;
  userId: string;
  items: WishlistItem[];
  isActive: boolean;        // default: true
  createdAt: Date;
  updatedAt: Date;
}

interface WishlistItem {
  productId: string;
  title: string;
  price: number;
  thumbnail: string;
  addedAt: Date;
}
```

**Indexes:** `{ userId, isActive }` compound

---

### Review

**Model:** `Review` | **Collection:** `reviews`

```typescript
interface Review {
  _id: ObjectId;
  productId: ObjectId;       // ref: Product
  userId: ObjectId;          // ref: User
  rating: number;            // 1-5
  comment: string;           // 1-1000 chars
  reviewerName: string;
  reviewerEmail: string;
  helpfulCount: number;      // default: 0, min: 0
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:** `{ productId, createdAt }`, `{ userId, productId }`, `rating`

---

### Ticket

**Model:** `Ticket` | **Collection:** `tickets`

```typescript
interface ITicket {
  _id: ObjectId;
  ticketId: string;           // unique, auto-generated "TKT{timestamp}{random}"
  user: ObjectId;             // ref: User
  order?: ObjectId;           // ref: Order
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;   // default: "medium"
  status: TicketStatus;       // default: "open"
  messages: ITicketMessage[];
  lastResponseAt?: Date;      // auto-updated on message add
  isEscalated: boolean;       // default: false
  createdAt: Date;
  updatedAt: Date;
}

interface ITicketMessage {
  sender: ObjectId;
  senderRole: UserRole;
  message: string;
  attachments?: string[];
  createdAt: Date;
}
```

**Indexes:** `user`, `status`, `category`, `priority`, `createdAt`

---

## Enums

```typescript
enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  WAITING_CUSTOMER = "waiting_customer",
  RESOLVED = "resolved",
  CLOSED = "closed"
}

enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}

enum TicketCategory {
  ORDER = "order",
  PAYMENT = "payment",
  DELIVERY = "delivery",
  REFUND = "refund",
  TECHNICAL = "technical",
  GENERAL = "general"
}
```

---

## DTOs (Response Interfaces)

### BaseDto

All entity DTOs extend this base:

```typescript
class BaseDto {
  id: string;          // mapped from _id
  createdAt: Date;
  updatedAt: Date;
}
```

---

### UserResponseDto

```typescript
class UserResponseDto extends BaseDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  status: string;
  role: string;
  addresses: AddressDto[];
}

class AddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: "home" | "work" | "billing" | "shipping";
}

class LoginResponseDto {
  user: UserResponseDto;
  token: string;
}

class SendOtpResponseDto {
  email: string;
  purpose: string;
  otpExpiry: Date;
  updateData?: Record<string, any>;
}

class VerifyOtpResponseDto {
  _id: string;
  email: string;
  status: string;
}

class ProfileResponseDto {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  status: string;
  addresses: AddressDto[];
  createdAt: Date;
  updatedAt: Date;
}

class UpdateProfileResponseDto {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  updatedFields: string[];
}
```

---

### ProductResponseDto

```typescript
class ProductResponseDto extends BaseDto {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
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
  warrantyInformation?: string;
  tags: string[];
  attributes?: Record<string, any>;
  thumbnail: string;
  images: string[];
  finalPrice: number;       // computed: price after discount
}

class CategoryDto {
  name: string;
  count: number;
}

class ProductStatsDto {
  totalProducts: number;
  totalCategories: number;
  averagePrice: number;
  lowStockProducts: number;
}
```

---

### CartResponseDto

```typescript
class CartResponseDto extends BaseDto {
  userId?: string;
  items: CartItemDto[];
  isActive: boolean;
  totalItems: number;       // computed from items
  totalAmount: number;      // computed from items
}

class CartItemDto {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
  addedAt: Date;
}

class CartStatsDto {
  totalCarts: number;
  totalItems: number;
  totalValue: number;
}
```

---

### OrderResponseDto

```typescript
class OrderResponseDto extends BaseDto {
  orderNumber: string;
  userId: string;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: "ONLINE" | "COD";
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  totalItems: number;
  stripeSessionId?: string;
  deliveryOtp?: string;
  deliveredAt?: Date;
  itemCount: number;         // computed: items.length
}

class OrderItemDto {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

class ShippingAddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

class PaymentHistoryDto {
  orderId: string;
  orderNumber: string;
  amount: number;
  status: string;
  method: string;
  date: Date;
}

class OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
```

---

### WishlistResponseDto

```typescript
class WishlistResponseDto extends BaseDto {
  userId: string;
  items: WishlistItemDto[];
  isActive: boolean;
  userDetails?: UserDetailsDto;
  totalItems: number;          // computed: items.length
}

class WishlistItemDto {
  productId: string;
  title: string;
  price: number;
  thumbnail: string;
  addedAt: Date;
}

class UserDetailsDto {
  userName: string;
  userEmail: string;
}

class WishlistStatsDto {
  totalItems: number;
  totalValue: number;
  userDetails?: UserDetailsDto;
}
```

---

### ReviewResponseDto

```typescript
class ReviewResponseDto extends BaseDto {
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerEmail: string;
  helpfulCount: number;
}

class ReviewWithDetailsDto extends BaseDto {
  productId: string;
  productName?: string;       // populated from Product
  userId: string;
  username?: string;          // populated from User
  userEmail?: string;         // populated from User
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerEmail: string;
  helpfulCount: number;
  isEditable: boolean;
}

class ReviewListResponseDto {
  reviews: ReviewWithDetailsDto[];
  pagination: {
    current: number;
    total: number;
    limit: number;
    totalReviews: number;
  };
}

class ReviewStatsResponseDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
```

---

### TicketResponseDto

```typescript
class TicketResponseDto extends BaseDto {
  ticketId: string;
  userId: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  isEscalated: boolean;
  messages: TicketMessageDto[];
  orderId?: string;
  assignedTo?: string;
  escalationLevel: number;
  resolvedAt?: Date;
  messageCount: number;       // computed: messages.length
}

class TicketMessageDto {
  sender: string;
  senderRole: UserRole;
  message: string;
  attachments: string[];
  createdAt: Date;
}

class AdminTicketDto extends BaseDto {
  ticketId: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  isEscalated: boolean;
  status: TicketStatus;
  createdAt: Date;
}

class TicketStatsDto {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  escalatedTickets: number;
}
```

---

## API Endpoints

### Health Check

| Method | Endpoint  | Auth | Description                    |
| ------ | --------- | ---- | ------------------------------ |
| GET    | `/health` | No   | API health check               |

**Response:**
```json
{
  "success": true,
  "status": "UP",
  "timestamp": "2026-03-30",
  "message": "E-commerce Inventory Backend API is healthy"
}
```

---

### User Routes

**Base:** `/api/users`

#### Public Endpoints

| # | Method | Endpoint           | Auth | Validation           | Description                           |
|---|--------|--------------------|------|----------------------|---------------------------------------|
| 1 | POST   | `/register`        | No   | RegisterUserSchema   | Register a new user                   |
| 2 | POST   | `/login`           | No   | LoginSchema          | Login with email and password         |
| 3 | POST   | `/send-otp`        | No   | SendOtpSchema        | Send OTP for registration/reset/update|
| 4 | POST   | `/verify-otp`      | No   | VerifyOtpSchema      | Verify OTP and activate account       |
| 5 | POST   | `/reset-password`  | No   | ResetPasswordSchema  | Reset password using OTP              |

#### Authenticated User Endpoints

| # | Method | Endpoint           | Auth   | Validation | Description                             |
|---|--------|--------------------|--------|------------|-----------------------------------------|
| 6 | POST   | `/logout`          | JWT    | -          | Logout and clear session                |
| 7 | GET    | `/profile`         | JWT    | -          | Get current user profile                |
| 8 | POST   | `/update-profile`  | JWT+USER | user.validator | Update profile with OTP verification |

---

#### 1. POST `/api/users/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "countryCode": "+1",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US",
      "isDefault": true,
      "addressType": "home"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "code": "USER_REGISTERED",
  "message": "User registered successfully. Please check your email for OTP verification.",
  "data": {
    "user": { ...UserResponseDto }
  }
}
```

**Error Codes:** `VALIDATION_ERROR` (400), `DUPLICATE_EMAIL` / `DUPLICATE_USERNAME` (409), `REGISTRATION_ERROR` (500)

---

#### 2. POST `/api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "LOGIN_SUCCESS",
  "message": "Login successful",
  "data": {
    "user": { ...UserResponseDto },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Codes:** `INVALID_CREDENTIALS` (401), `ACCOUNT_NOT_ACTIVE` (403), `LOGIN_ERROR` (500)

---

#### 3. POST `/api/users/send-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "purpose": "registration" | "password_reset" | "profile_update",
  "updateData": { ... }
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "OTP_SENT",
  "message": "OTP sent to your email",
  "data": { ...SendOtpResponseDto }
}
```

---

#### 4. POST `/api/users/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "OTP_VERIFIED",
  "message": "OTP verified successfully. Your account is now active. You can login now.",
  "data": { ...VerifyOtpResponseDto }
}
```

---

#### 5. POST `/api/users/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "PASSWORD_RESET_SUCCESS",
  "message": "Password reset successfully. Please login with your new password."
}
```

---

#### 6. POST `/api/users/logout`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "code": "LOGOUT_SUCCESS",
  "message": "Logout successful"
}
```

---

#### 7. GET `/api/users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "code": "PROFILE_RETRIEVED",
  "message": "Profile retrieved successfully",
  "data": {
    "user": { ...ProfileResponseDto }
  }
}
```

---

#### 8. POST `/api/users/update-profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "PROFILE_UPDATED",
  "message": "Profile updated successfully",
  "data": { ...UpdateProfileResponseDto }
}
```

---

### Admin Routes

**Base:** `/api/users`

#### Admin Endpoints (requires ADMIN role)

| # | Method | Endpoint        | Auth       | Description                   |
|---|--------|-----------------|------------|-------------------------------|
| 1 | GET    | `/`             | JWT+ADMIN  | Get all users (USER role)     |
| 2 | GET    | `/:id`          | JWT+ADMIN  | Get user by ID                |
| 3 | PUT    | `/:id`          | JWT+ADMIN  | Update user                   |
| 4 | DELETE | `/:id`          | JWT+ADMIN  | Delete user                   |

#### Super Admin Endpoints (requires SUPER_ADMIN role)

| # | Method | Endpoint         | Auth            | Description              |
|---|--------|------------------|-----------------|--------------------------|
| 5 | POST   | `/admin/create`  | JWT+SUPER_ADMIN | Create admin user        |
| 6 | GET    | `/admin/list`    | JWT+SUPER_ADMIN | List all admins          |
| 7 | GET    | `/admin/:id`     | JWT+SUPER_ADMIN | Get admin by ID          |
| 8 | PUT    | `/admin/:id`     | JWT+SUPER_ADMIN | Update admin             |
| 9 | DELETE | `/admin/:id`     | JWT+SUPER_ADMIN | Delete admin             |

---

#### 1. GET `/api/users/`

**Query Params:** `page` (default: 1), `limit` (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [ ...UserResponseDto[] ],
  "pagination": { ...PaginationMetadata },
  "message": "Users retrieved successfully"
}
```

---

#### 5. POST `/api/users/admin/create`

**Request Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  },
  "message": "Admin user created successfully"
}
```

---

### Product Routes

**Base:** `/api/products`

#### Public Endpoints

| # | Method | Endpoint                                    | Auth | Description                             |
|---|--------|---------------------------------------------|------|-----------------------------------------|
| 1 | GET    | `/`                                         | No   | Get all products (paginated, filterable)|
| 2 | GET    | `/categories`                               | No   | Get all categories                      |
| 3 | GET    | `/categories/:categoryName/subcategories`   | No   | Get subcategories for a category        |
| 4 | GET    | `/filters`                                  | No   | Get available product filters           |
| 5 | GET    | `/stats`                                    | No   | Get product statistics                  |
| 6 | GET    | `/:id`                                      | No   | Get product by ID                       |
| 7 | POST   | `/validate-category`                        | No   | Validate and normalize a category name  |

#### Admin Endpoints

| #  | Method | Endpoint            | Auth            | Description                        |
|----|--------|---------------------|-----------------|------------------------------------|
| 8  | POST   | `/`                 | JWT+ADMIN       | Create product (multipart/form-data)|
| 9  | PUT    | `/:id`              | JWT+ADMIN       | Update product                     |
| 10 | DELETE | `/:id`              | JWT+ADMIN       | Delete product                     |
| 11 | POST   | `/bulk-update`      | JWT+ADMIN       | Bulk update products               |

#### Super Admin Endpoints

| #  | Method | Endpoint            | Auth               | Description                             |
|----|--------|---------------------|--------------------|-----------------------------------------|
| 12 | POST   | `/fetch-store`      | JWT+SUPER_ADMIN    | Fetch & store from external API         |
| 13 | POST   | `/update-existing`  | JWT+SUPER_ADMIN    | Update products from external API       |
| 14 | POST   | `/clean-data`       | JWT+SUPER_ADMIN    | Clean product data                      |

---

#### 1. GET `/api/products/`

**Query Params:**

| Param      | Type   | Default | Description                    |
|------------|--------|---------|--------------------------------|
| `page`     | number | 1       | Page number                    |
| `limit`    | number | 10      | Records per page               |
| `search`   | string | -       | Search in title/description    |
| `category` | string | -       | Filter by category name        |

**Response (200):**
```json
{
  "success": true,
  "code": "PRODUCTS_RETRIEVED",
  "message": "Products retrieved successfully",
  "data": [ ...ProductResponseDto[] ],
  "pagination": { ...PaginationMetadata },
  "filters": {
    "applied": []
  }
}
```

---

#### 6. GET `/api/products/:id`

**Response (200):**
```json
{
  "success": true,
  "code": "PRODUCT_RETRIEVED",
  "message": "Product retrieved successfully",
  "data": { ...ProductResponseDto }
}
```

**Error:** `PRODUCT_NOT_FOUND` (404)

---

#### 8. POST `/api/products/`

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field                | Type     | Required | Description               |
|----------------------|----------|----------|---------------------------|
| `title`              | string   | Yes      | Product title             |
| `description`        | string   | Yes      | Product description       |
| `category`           | string   | Yes      | Category name             |
| `subCategory`        | string   | No       | Sub-category name         |
| `barcode`            | string   | Yes      | Unique barcode            |
| `itemCode`           | string   | Yes      | Item code                 |
| `sku`                | string   | Yes      | SKU                       |
| `price`              | string   | Yes      | Price (parsed as number)  |
| `discountPercentage` | string   | No       | Discount %                |
| `stock`              | string   | No       | Stock quantity            |
| `isFeatured`         | string   | No       | "true" / "false"          |
| `minimumOrderQuantity`| string  | No       | Min order quantity        |
| `warrantyInformation`| string   | No       | Warranty info             |
| `tags`               | string   | No       | JSON array of tags        |
| `attributes`         | string   | No       | JSON object               |
| `images`             | File[]   | Yes      | Product images (uploaded to S3) |

**Response (201):**
```json
{
  "success": true,
  "code": "PRODUCT_CREATED",
  "message": "Product created successfully",
  "data": { ...ProductResponseDto }
}
```

**Error Codes:** `MISSING_REQUIRED_FIELD` (400), `VALIDATION_ERROR` (400), `DUPLICATE_FIELD` (409)

---

#### 2. GET `/api/products/categories`

**Response (200):**
```json
{
  "success": true,
  "code": "CATEGORIES_RETRIEVED",
  "message": "Categories retrieved successfully",
  "data": [
    { "name": "Electronics", "count": 42 },
    { "name": "Groceries", "count": 35 }
  ]
}
```

---

#### 5. GET `/api/products/stats`

**Response (200):**
```json
{
  "success": true,
  "code": "PRODUCT_STATS_RETRIEVED",
  "message": "Product statistics retrieved successfully",
  "data": {
    "totalProducts": 150,
    "totalCategories": 12,
    "averagePrice": 29.99,
    "lowStockProducts": 5
  }
}
```

---

### Cart Routes

**Base:** `/api/cart`

All cart endpoints require authentication (`JWT`).

| # | Method | Endpoint            | Auth      | Validation          | Description                  |
|---|--------|---------------------|-----------|---------------------|------------------------------|
| 1 | GET    | `/`                 | JWT       | -                   | Get or create cart           |
| 2 | POST   | `/add`              | JWT       | AddToCartSchema     | Add item to cart             |
| 3 | PUT    | `/item/:productId`  | JWT       | UpdateCartItemSchema| Update item quantity         |
| 4 | DELETE | `/item/:productId`  | JWT       | -                   | Remove item from cart        |
| 5 | DELETE | `/clear`            | JWT       | -                   | Clear all cart items         |
| 6 | GET    | `/stats`            | JWT       | -                   | Get cart statistics          |
| 7 | POST   | `/validate`         | JWT       | -                   | Validate cart (stock check)  |
| 8 | GET    | `/guest-carts`      | JWT+ADMIN | -                   | Get all guest carts          |

---

#### 2. POST `/api/cart/add`

**Request Body:**
```json
{
  "productId": "60f7b2c9e1d3a2001c8e4f5a",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "ITEM_ADDED",
  "message": "Item added to cart successfully",
  "data": { ...CartResponseDto }
}
```

---

#### 7. POST `/api/cart/validate`

**Response (200):**
```json
{
  "success": true,
  "code": "CART_VALIDATED",
  "message": "Cart validation completed",
  "data": {
    "allItemsAvailable": true,
    "validationResults": [ ... ],
    "cartTotal": 59.98
  }
}
```

---

### Order Routes

**Base:** `/api/orders`

#### User Endpoints

| # | Method | Endpoint                    | Auth | Validation               | Description                    |
|---|--------|-----------------------------|------|--------------------------|--------------------------------|
| 1 | POST   | `/`                         | JWT  | CreateOrderSchema        | Create order from cart         |
| 2 | GET    | `/`                         | JWT  | -                        | Get user's orders              |
| 3 | GET    | `/stats`                    | JWT  | -                        | Get user's order stats         |
| 4 | GET    | `/order/:orderNumber`       | JWT  | -                        | Get order by order number      |
| 5 | GET    | `/:orderId`                 | JWT  | -                        | Get order by ID                |
| 6 | DELETE | `/:orderId/cancel`          | JWT  | -                        | Cancel an order                |
| 7 | GET    | `/payments/history`         | JWT  | -                        | Get payment history            |

#### Admin Endpoints

| #  | Method | Endpoint                    | Auth      | Validation              | Description                  |
|----|--------|-----------------------------|-----------|-----------------------  |------------------------------|
| 8  | GET    | `/admin/all`                | JWT+ADMIN | -                       | Get all orders               |
| 9  | PUT    | `/admin/:orderId/status`    | JWT+ADMIN | UpdateOrderStatusSchema | Update order status          |
| 10 | PUT    | `/admin/:orderId/ship`      | JWT+ADMIN | ShipOrderSchema         | Ship order (sends OTP email) |

---

#### 1. POST `/api/orders/`

**Request Body:**
```json
{
  "paymentMethod": "ONLINE",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response (201) - COD:**
```json
{
  "success": true,
  "code": "ORDER_CREATED",
  "message": "Order created successfully",
  "data": { ...OrderResponseDto }
}
```

**Response (201) - ONLINE (Stripe):**
```json
{
  "success": true,
  "code": "ORDER_CREATED",
  "message": "Order created successfully",
  "data": { ...OrderResponseDto },
  "checkoutSession": {
    "id": "cs_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

---

#### 3. GET `/api/orders/stats`

**Response (200):**
```json
{
  "success": true,
  "code": "ORDER_STATS_RETRIEVED",
  "message": "Order statistics retrieved successfully",
  "data": {
    "totalOrders": 15,
    "pendingOrders": 2,
    "confirmedOrders": 3,
    "shippedOrders": 5,
    "deliveredOrders": 4,
    "cancelledOrders": 1,
    "totalRevenue": 1250.00
  }
}
```

---

#### 7. GET `/api/orders/payments/history`

**Query Params:** `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": [ ...PaymentHistoryDto[] ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRecords": 25,
    "recordsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Payment history retrieved successfully"
}
```

---

#### 10. PUT `/api/orders/admin/:orderId/ship`

Ships an order and sends a delivery OTP to the customer via email.

**Response (200):**
```json
{
  "success": true,
  "data": { ...OrderResponseDto },
  "message": "Order shipped successfully. Delivery OTP has been sent to the user."
}
```

---

### Wishlist Routes

**Base:** `/api/wishlist`

#### User Endpoints

| # | Method | Endpoint            | Auth | Validation          | Description                  |
|---|--------|---------------------|------|---------------------|------------------------------|
| 1 | GET    | `/`                 | JWT  | -                   | Get user's wishlist          |
| 2 | POST   | `/add`              | JWT  | AddToWishlistSchema | Add item to wishlist         |
| 3 | DELETE | `/item/:productId`  | JWT  | -                   | Remove item from wishlist    |
| 4 | DELETE | `/clear`            | JWT  | -                   | Clear entire wishlist        |
| 5 | GET    | `/stats`            | JWT  | -                   | Get wishlist statistics      |

#### Admin Endpoints

| # | Method | Endpoint                     | Auth      | Description                        |
|---|--------|------------------------------|-----------|------------------------------------|
| 6 | GET    | `/admin/user/:userId`        | JWT+ADMIN | Get wishlist by user ID            |
| 7 | GET    | `/admin/user/:userId/stats`  | JWT+ADMIN | Get wishlist stats by user ID      |
| 8 | GET    | `/admin/users`               | JWT+ADMIN | Get all users with wishlists       |

---

#### 2. POST `/api/wishlist/add`

**Request Body:**
```json
{
  "productId": "60f7b2c9e1d3a2001c8e4f5a"
}
```

**Response (200):**
```json
{
  "success": true,
  "code": "ITEM_ADDED",
  "message": "Item added to wishlist successfully",
  "data": { ...WishlistResponseDto }
}
```

---

### Review Routes

**Base:** `/api/reviews`

| # | Method | Endpoint              | Auth         | Validation          | Description                     |
|---|--------|-----------------------|--------------|---------------------|---------------------------------|
| 1 | POST   | `/:productId`         | JWT          | CreateReviewSchema  | Create review for a product     |
| 2 | GET    | `/:productId`         | Optional JWT | -                   | Get reviews for a product       |
| 3 | GET    | `/user/reviews`       | JWT          | -                   | Get current user's reviews      |
| 4 | PUT    | `/:id`                | JWT          | UpdateReviewSchema  | Update a review                 |
| 5 | DELETE | `/:id`                | JWT          | -                   | Delete a review                 |
| 6 | POST   | `/:id/helpful`        | No           | -                   | Mark review as helpful (+1)     |

---

#### 1. POST `/api/reviews/:productId`

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Great product, fast delivery!"
}
```

**Validation:**
- `rating`: number, 1-5, required
- `comment`: string, max 1000 chars, required

**Response (201):**
```json
{
  "success": true,
  "code": "REVIEW_CREATED",
  "message": "Review created successfully",
  "data": { ...ReviewResponseDto }
}
```

**Error Codes:** `UNAUTHORIZED` (401), `PRODUCT_NOT_FOUND` (404), `REVIEW_EXISTS` (400)

---

#### 2. GET `/api/reviews/:productId`

**Query Params:**

| Param   | Type   | Default  | Description                          |
|---------|--------|----------|--------------------------------------|
| `page`  | number | 1        | Page number                          |
| `limit` | number | 10       | Reviews per page                     |
| `sort`  | string | "newest" | Sort order: "newest", "oldest", "highest", "lowest", "helpful" |

**Response (200):**
```json
{
  "success": true,
  "code": "REVIEWS_RETRIEVED",
  "message": "Reviews retrieved successfully",
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

---

### Ticket Routes

**Base:** `/api/tickets`

#### User Endpoints

| # | Method | Endpoint                | Auth | Validation          | Description                  |
|---|--------|-------------------------|------|---------------------|------------------------------|
| 1 | POST   | `/`                     | JWT  | CreateTicketSchema  | Create support ticket        |
| 2 | GET    | `/`                     | JWT  | -                   | Get user's tickets           |
| 3 | GET    | `/:ticketId`            | JWT  | -                   | Get ticket by ID             |
| 4 | POST   | `/:ticketId/messages`   | JWT  | AddMessageSchema    | Add message to ticket        |
| 5 | PATCH  | `/:ticketId/close`      | JWT  | -                   | Close a ticket               |

#### Admin Endpoints

| #  | Method | Endpoint                        | Auth      | Validation                 | Description                  |
|----|--------|--------------------------------|-----------|--------------------------- |------------------------------|
| 6  | GET    | `/admin/all`                   | JWT+ADMIN | -                          | Get all tickets (filterable) |
| 7  | GET    | `/admin/stats`                 | JWT+ADMIN | -                          | Get ticket statistics        |
| 8  | GET    | `/admin/:ticketId`             | JWT+ADMIN | -                          | Get any ticket by ID         |
| 9  | PATCH  | `/admin/:ticketId/status`      | JWT+ADMIN | UpdateTicketStatusSchema   | Update ticket status         |
| 10 | PATCH  | `/admin/:ticketId/priority`    | JWT+ADMIN | UpdateTicketPrioritySchema | Update ticket priority       |
| 11 | PATCH  | `/admin/:ticketId/escalate`    | JWT+ADMIN | -                          | Escalate ticket              |
| 12 | POST   | `/admin/:ticketId/messages`    | JWT+ADMIN | AddMessageSchema           | Add admin reply              |

---

#### 1. POST `/api/tickets/`

**Request Body:**
```json
{
  "subject": "Order not delivered",
  "category": "delivery",
  "priority": "high",
  "message": "My order #ORD123456 has not been delivered after 5 days.",
  "orderId": "60f7b2c9e1d3a2001c8e4f5a"
}
```

**Validation:**
- `subject`: string, required, trimmed
- `category`: one of `order`, `payment`, `delivery`, `refund`, `technical`, `general`
- `priority`: one of `low`, `medium`, `high`, `urgent` (default: `medium`)
- `message`: string, required
- `orderId`: string, optional (MongoDB ObjectId)

**Response (201):**
```json
{
  "success": true,
  "code": "TICKET_CREATED",
  "message": "Ticket created successfully",
  "data": { ...TicketResponseDto }
}
```

---

#### 6. GET `/api/tickets/admin/all`

**Query Params:**

| Param      | Type   | Description                        |
|------------|--------|------------------------------------|
| `page`     | number | Page number                        |
| `limit`    | number | Records per page                   |
| `status`   | string | Filter by status                   |
| `category` | string | Filter by category                 |
| `priority` | string | Filter by priority                 |
| `search`   | string | Search in subject/ticketId         |

---

#### 7. GET `/api/tickets/admin/stats`

**Response (200):**
```json
{
  "success": true,
  "code": "STATS_RETRIEVED",
  "message": "Ticket statistics retrieved successfully",
  "data": {
    "totalTickets": 50,
    "openTickets": 12,
    "inProgressTickets": 8,
    "resolvedTickets": 20,
    "closedTickets": 10,
    "escalatedTickets": 3
  }
}
```

---

### Webhook Routes

**Base:** `/api/webhooks`

| # | Method | Endpoint  | Auth | Description                    |
|---|--------|-----------|------|--------------------------------|
| 1 | POST   | `/stripe` | No   | Handle Stripe webhook events   |

#### POST `/api/webhooks/stripe`

**Headers:** `stripe-signature: <webhook_signature>`
**Content-Type:** `application/json` (raw body)

Handles Stripe events:
- `checkout.session.completed` - Updates order payment status to PAID

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "received": true
}
```

---

## Pagination

All list endpoints support pagination via query parameters.

| Parameter | Type   | Default | Description           |
|-----------|--------|---------|-----------------------|
| `page`    | number | 1       | Current page number   |
| `limit`   | number | 10-20   | Records per page      |

### Pagination Response Shape

```typescript
interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

---

## Environment Variables

| Variable                 | Required | Description                          |
|--------------------------|----------|--------------------------------------|
| `MONGODB_URI`            | Yes      | MongoDB connection string            |
| `PORT`                   | No       | Server port (default: 3000)          |
| `JWT_SECRET`             | Yes      | Secret key for JWT signing           |
| `EMAIL_USER`             | Yes      | SMTP email address                   |
| `EMAIL_PASS`             | Yes      | SMTP email password                  |
| `DUMMY_PRODUCTS_API`     | No       | External products API URL            |
| `SUPER_ADMIN_USERNAME`   | Yes      | Initial super admin username         |
| `SUPER_ADMIN_EMAIL`      | Yes      | Initial super admin email            |
| `SUPER_ADMIN_PASSWORD`   | Yes      | Initial super admin password         |
| `STRIPE_SECRET_KEY`      | Yes      | Stripe secret API key                |
| `STRIPE_PUBLISHABLE_KEY` | Yes      | Stripe publishable key               |
| `STRIPE_WEBHOOK_SECRET`  | Yes      | Stripe webhook signing secret        |
| `AWS_ACCESS_KEY_ID`      | Yes      | AWS access key                       |
| `AWS_SECRET_ACCESS_KEY`  | Yes      | AWS secret key                       |
| `AWS_REGION`             | No       | AWS region (default: us-east-1)      |
| `AWS_S3_BUCKET`          | Yes      | S3 bucket name for image uploads     |
| `AWS_S3_FOLDER_PREFIX`   | No       | S3 folder prefix for uploads         |

---

## Validation Schemas (Zod)

### RegisterUserSchema
```typescript
{
  username: string;
  email: string (email format);
  password: string;
  confirmPassword: string (must match password);
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  addresses?: Address[];
}
```

### CreateOrderSchema
```typescript
{
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "ONLINE" | "COD";
  successUrl?: string;
  cancelUrl?: string;
}
```

### CreateProductSchema (form-data)
```typescript
{
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  barcode: string;
  itemCode: string;
  sku: string;
  price: string;              // parsed as number
  discountPercentage?: string;
  stock?: string;
  isFeatured?: string;        // "true" | "false"
  minimumOrderQuantity?: string;
  warrantyInformation?: string;
  tags?: string;               // JSON array
  attributes?: string;         // JSON object
}
```

### CreateReviewSchema
```typescript
{
  rating: number;     // 1-5
  comment: string;    // max 1000 chars
}
```

### CreateTicketSchema
```typescript
{
  subject: string;
  category: "order" | "payment" | "delivery" | "refund" | "technical" | "general";
  priority?: "low" | "medium" | "high" | "urgent";
  message: string;
  orderId?: string;
}
```

### AddToCartSchema
```typescript
{
  productId: string;
  quantity?: number;   // default: 1
}
```

### AddToWishlistSchema
```typescript
{
  productId: string;
}
```

---

*Generated from source code analysis of the FMCG E-Commerce Backend.*
