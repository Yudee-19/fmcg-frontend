'use client';

import { useAuthStore } from '@/store/authStore';
import { clientFetch, ApiError } from './apiClient';

// ═══════════════════════════════════════════════════════════════════════════
// Admin API — All endpoints require JWT + ADMIN or SUPER_ADMIN role
// ═══════════════════════════════════════════════════════════════════════════

// ─── User Management (ADMIN) ────────────────────────────────────────────────

// ADM-USR-01: List all users (USER role only)
export const getUsers = (page = 1, limit = 20) =>
  clientFetch<any>(`/users?page=${page}&limit=${limit}`);

// ADM-USR-02: Get user by ID
export const getUserById = (id: string) =>
  clientFetch<any>(`/users/${id}`);

// ADM-USR-03: Update user
export const updateUser = (id: string, data: any) =>
  clientFetch<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// ADM-USR-04: Delete user
export const deleteUser = (id: string) =>
  clientFetch<any>(`/users/${id}`, { method: 'DELETE' });

// ─── Admin User Management (SUPER_ADMIN) ────────────────────────────────────

// ADM-SA-01: Create admin user
export const createAdmin = (payload: {
  username: string;
  email: string;
  password: string;
}) =>
  clientFetch<any>('/users/admin/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ADM-SA-02: List all admins
export const getAdmins = () => clientFetch<any>('/users/admin/list');

// ADM-SA-03: Get admin by ID
export const getAdminById = (id: string) =>
  clientFetch<any>(`/users/admin/${id}`);

// ADM-SA-04: Update admin
export const updateAdmin = (id: string, data: any) =>
  clientFetch<any>(`/users/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// ADM-SA-05: Delete admin
export const deleteAdmin = (id: string) =>
  clientFetch<any>(`/users/admin/${id}`, { method: 'DELETE' });

// ─── Product Management (ADMIN) ─────────────────────────────────────────────

// ADM-PRD-01: Create product (multipart/form-data — images uploaded to S3)
export const createProduct = (formData: FormData) => {
  const token = useAuthStore.getState().token;
  const API = process.env.NEXT_PUBLIC_API_URL!;

  return fetch(`${API}/products`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Do NOT set Content-Type — browser sets multipart boundary automatically
    },
    body: formData,
  }).then(async (res) => {
    const data = await res.json();
    if (!data.success) {
      throw new ApiError(
        data.error?.code ?? 'UNKNOWN_ERROR',
        data.error?.message ?? 'Request failed',
        res.status
      );
    }
    return data;
  });
};

// ADM-PRD-02: Update product
export const updateProduct = (id: string, data: any) =>
  clientFetch<any>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// ADM-PRD-03: Delete product
export const deleteProduct = (id: string) =>
  clientFetch<any>(`/products/${id}`, { method: 'DELETE' });

// ADM-PRD-04: Bulk update products
export const bulkUpdateProducts = (data: any) =>
  clientFetch<any>('/products/bulk-update', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ADM-PRD-05: Bulk create products (JSON body, no images)
export const bulkCreateProducts = (products: any[]) =>
  clientFetch<any>('/products/bulk-create', {
    method: 'POST',
    body: JSON.stringify({ products }),
  });

// ─── Product Data Management (SUPER_ADMIN) ──────────────────────────────────

// ADM-PRD-SA-01: Fetch products from external API and store
export const fetchAndStoreProducts = () =>
  clientFetch<any>('/products/fetch-store', { method: 'POST' });

// ADM-PRD-SA-02: Update existing products from external API
export const updateExistingProducts = () =>
  clientFetch<any>('/products/update-existing', { method: 'POST' });

// ADM-PRD-SA-03: Clean product data
export const cleanProductData = () =>
  clientFetch<any>('/products/clean-data', { method: 'POST' });

// ─── Cart Admin (ADMIN) ─────────────────────────────────────────────────────

// ADM-CRT-01: Get all guest carts
export const getGuestCarts = () => clientFetch<any>('/cart/guest-carts');

// ADM-CRT-02: Get all users with their carts (paginated + search)
export const getCartUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const q = new URLSearchParams(
    Object.entries(params ?? {}).reduce(
      (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
      {} as Record<string, string>
    )
  ).toString();
  return clientFetch<any>(`/cart/admin/users${q ? `?${q}` : ''}`);
};

// ADM-CRT-03: Get specific user's cart
export const getUserCart = (userId: string) =>
  clientFetch<any>(`/cart/admin/user/${userId}`);

// ─── Order Management (ADMIN) ───────────────────────────────────────────────

// ADM-ORD-01: Get all orders
export const getAllOrders = (params?: {
  page?: number;
  limit?: number;
}) => {
  const q = new URLSearchParams(
    Object.entries(params ?? {}).reduce(
      (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
      {} as Record<string, string>
    )
  ).toString();
  return clientFetch<any>(`/orders/admin/all${q ? `?${q}` : ''}`);
};

// ADM-ORD-02: Update order status
export const updateOrderStatus = (orderId: string, data: any) =>
  clientFetch<any>(`/orders/admin/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// ADM-ORD-03: Ship order (sends delivery OTP email to customer)
export const shipOrder = (orderId: string) =>
  clientFetch<any>(`/orders/admin/${orderId}/ship`, { method: 'PUT' });

// ADM-ORD-04: Initiate refund for a paid order
export const refundOrder = (orderId: string) =>
  clientFetch<any>(`/orders/admin/${orderId}/refund`, { method: 'POST' });

// ─── Wishlist Admin (ADMIN) ─────────────────────────────────────────────────

// ADM-WSH-01: Get wishlist by user ID
export const getUserWishlist = (userId: string) =>
  clientFetch<any>(`/wishlist/admin/user/${userId}`);

// ADM-WSH-02: Get wishlist stats by user ID
export const getUserWishlistStats = (userId: string) =>
  clientFetch<any>(`/wishlist/admin/user/${userId}/stats`);

// ADM-WSH-03: List all users with wishlists
export const getWishlistUsers = () =>
  clientFetch<any>('/wishlist/admin/users');

// ─── Ticket Admin (ADMIN) ───────────────────────────────────────────────────

// ADM-TKT-01: Get all tickets (filterable)
export const getAllTickets = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}) => {
  const q = new URLSearchParams(
    Object.entries(params ?? {}).reduce(
      (acc, [k, v]) => (v != null ? { ...acc, [k]: String(v) } : acc),
      {} as Record<string, string>
    )
  ).toString();
  return clientFetch<any>(`/tickets/admin/all${q ? `?${q}` : ''}`);
};

// ADM-TKT-02: Get ticket statistics
export const getTicketStats = () =>
  clientFetch<any>('/tickets/admin/stats');

// ADM-TKT-03: Get any ticket by ID (admin view)
export const getAdminTicket = (ticketId: string) =>
  clientFetch<any>(`/tickets/admin/${ticketId}`);

// ADM-TKT-04: Update ticket status
export const updateTicketStatus = (ticketId: string, status: string) =>
  clientFetch<any>(`/tickets/admin/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ADM-TKT-05: Update ticket priority
export const updateTicketPriority = (ticketId: string, priority: string) =>
  clientFetch<any>(`/tickets/admin/${ticketId}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
  });

// ADM-TKT-06: Escalate ticket
export const escalateTicket = (ticketId: string) =>
  clientFetch<any>(`/tickets/admin/${ticketId}/escalate`, { method: 'PATCH' });

// ADM-TKT-07: Admin reply to ticket
export const adminReplyToTicket = (ticketId: string, message: string) =>
  clientFetch<any>(`/tickets/admin/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
