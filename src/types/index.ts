// Localized field types — product data is stored in { en, ar }
export interface LocalizedString {
    en: string;
    ar: string;
}

export interface LocalizedRecord {
    en: Record<string, any>;
    ar: Record<string, any>;
}

// Matches ProductResponseDto (updated schema — description REMOVED per changelog)
export interface Product {
    id: string;
    slug: string;
    title: LocalizedString;
    category: LocalizedString;
    subCategory?: LocalizedString;
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
    warrantyInformation?: LocalizedString;
    tags: string[];
    attributes?: LocalizedRecord;
    thumbnail: string;
    images: string[];
    searchKeywords?: string[];
    createdAt: string;
    updatedAt: string;
}

// Flattened English-only DTO — used in list views and recommendations
export interface ProductListDto {
    id: string;
    slug?: string;
    title: string;
    category: string;
    subCategory: string;
    price: number;
    discountPercentage: number;
    rating: number;
    reviewCount: number;
    stock: number;
    thumbnail: string;
    isFeatured: boolean;
    finalPrice: number;
    createdAt: string;
    updatedAt: string;
}

// GET /products/:id — product is returned as `data`, recommendations as top-level `recommended`
export interface ProductDetailApiResponse {
    success: boolean;
    code: string;
    message: string;
    data: Product;
    recommended: ProductListDto[];
}

export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    countryCode: string;
    status: "ACTIVE" | "INACTIVE";
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    createdAt: string;
    updatedAt: string;
}

// Banner (homepage carousel)
export interface Banner {
    _id: string;
    imageUrl: string;
    imageKey: string;
    position: number;
    status: "PUBLISHED" | "DRAFT";
    createdAt: string;
    updatedAt: string;
}

// Standalone address entity (decoupled from User)
export interface Address {
    id: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    addressType: "home" | "work" | "billing" | "shipping";
    createdAt: string;
    updatedAt: string;
}

// Profile response — restructured per changelog
export interface ProfileUserDto {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileAddressDto {
    id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type: string;
    isDefault: boolean;
}

export interface ProfileResponse {
    user: ProfileUserDto;
    addresses: ProfileAddressDto[];
}

// Admin cart DTO
export interface AdminCartUserDto {
    id: string;
    userId?: string;
    user: {
        name: string;
        email: string;
        phone: string | null;
    };
    totalAmount: number;
    totalItems: number;
    lastUpdated?: string;
}

export interface CartItem {
    productId: string;
    title: LocalizedString | string;
    price: number;
    quantity: number;
    thumbnail: string;
    addedAt: string;
    sku?: string;
    variantId?: string;
    variantName?: string;
}

export interface Cart {
    id: string;
    userId?: string;
    items: CartItem[];
    isActive: boolean;
    totalItems?: number;
    totalAmount?: number;
    createdAt?: string;
    updatedAt?: string;
    userDetails?: {
        userName: string;
        userEmail: string;
        userPhone?: string;
    };
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: "ONLINE" | "COD";
    paymentStatus: "PENDING" | "PROCESSING" | "PAID" | "REFUNDED" | "FAILED";
    orderStatus:
        | "PENDING"
        | "CONFIRMED"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED";
    totalAmount: number;
    totalItems: number;
    stripeSessionId?: string;
    deliveryOtp?: string;
    deliveredAt?: string;
    itemCount: number;
    sessionExpiresAt?: string;
    cancellationReason?: string;
    refundStatus: "NONE" | "REQUESTED" | "INITIATED" | "COMPLETED" | "FAILED";
    refundId?: string;
    refundAmount?: number;
    refundedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: string;
    title: LocalizedString | string;
    price: number;
    quantity: number;
    thumbnail: string;
    variantId?: string;
    variantName?: string;
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
    productName?: string;
    userId: string;
    username?: string;
    userEmail?: string;
    rating: number;
    comment: string;
    reviewerName: string;
    reviewerEmail: string;
    helpfulCount: number;
    isEditable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewListResponse {
    reviews: Review[];
    stats?: ReviewStats;
    pagination: {
        current: number;
        total: number;
        limit: number;
        totalReviews: number;
    };
}

export interface ReviewStats {
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

export interface WishlistItem {
    productId: string;
    title: LocalizedString | string;
    price: number;
    thumbnail: string;
    addedAt: string;
}

export interface Ticket {
    id: string;
    ticketId: string;
    userId: string;
    subject: string;
    category:
        | "order"
        | "payment"
        | "delivery"
        | "refund"
        | "technical"
        | "general";
    priority: "low" | "medium" | "high" | "urgent";
    status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
    isEscalated: boolean;
    messages: TicketMessage[];
    orderId?: string;
    assignedTo?: string;
    escalationLevel?: number;
    resolvedAt?: string;
    messageCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface TicketMessage {
    sender: string;
    senderRole: "USER" | "ADMIN" | "SUPER_ADMIN";
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

// --- Category DTO (now returns LocalizedString[]) ---

export type CategoryDto = LocalizedString;

// --- Filters response from GET /products/filters ---

export interface FilterCategoryDto {
    en: string;
    ar: string;
    subCategories: LocalizedString[];
}

export interface FiltersResponse {
    queryParams: {
        sortBy: string[];
        values: string[];
    };
    categories: FilterCategoryDto[];
    priceRange: {
        min: number;
        max: number;
    };
    ratingRange?: {
        min: number;
        max: number;
    };
    tags: string[];
}

// --- Wishlist wrapper ---

export interface Wishlist {
    id: string;
    userId?: string;
    items: WishlistItem[];
    isActive: boolean;
    totalItems?: number;
    userDetails?: {
        userName: string;
        userEmail: string;
        userPhone?: string;
    };
    createdAt: string;
    updatedAt: string;
}

// --- Profile update ---

export interface UpdateProfileResponseDto {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    updatedFields: string[];
}

// --- Payment history ---

export interface PaymentHistoryDto {
    orderId: string;
    orderNumber: string;
    amount: number;
    status: string;
    method: string;
    date: string;
}

// --- Admin / Stats DTOs ---

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

export interface AdminWishlistUserDto {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    itemCount: number;
    totalValue: number;
    lastUpdated: string;
}

export interface TicketStatsDto {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    escalatedTickets: number;
}

export interface AdminTicketDto {
    id: string;
    ticketId: string;
    subject: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    isEscalated: boolean;
    status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
    createdAt: string;
}
