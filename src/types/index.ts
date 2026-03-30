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
  finalPrice: number;
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
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
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
  category:
    | 'order'
    | 'payment'
    | 'delivery'
    | 'refund'
    | 'technical'
    | 'general';
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
