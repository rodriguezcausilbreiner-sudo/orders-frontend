// ============================================
// TIPOS BASE DEL DOMINIO - OMS Portal
// ============================================

// --- CUSTOMER ---
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  phone: string;
  fullName?: string;
}

// --- SUPPLIER ---
export interface Supplier {
  id: number;
  companyName: string;
  contactName: string;
  contactTitle: string;
  city: string;
  country: string;
  phone: string;
  fax?: string;
}

// --- PRODUCT ---
export interface Product {
  id: number;
  productName: string;
  supplierId: number;
  supplier?: Supplier;
  unitPrice: number;
  package: string;
  isDiscontinued: boolean;
}

// --- ORDER ITEM ---
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product?: Product;
  unitPrice: number;
  quantity: number;
  subtotal?: number;
}

// --- ORDER ---
export type OrderStatus = 'Pending' | 'Processing' | 'Delivered' | 'Cancelled' | 'Sent';

export interface Order {
  id: number;
  orderDate: string;
  orderNumber: string;
  customerId: number;
  customer?: Customer;
  totalAmount: number;
  status?: OrderStatus;
  items?: OrderItem[];
}

// ============================================
// TIPOS DE PAGINACIÓN
// ============================================
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// TIPOS DE REQUEST
// ============================================
export interface CreateOrderRequest {
  customerId: number;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface UpdateOrderRequest {
  orderDate?: string;
  customerId?: number;
  status?: OrderStatus;
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  unitPrice?: number;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  phone: string;
}

export interface UpdateProductRequest {
  unitPrice?: number;
  isDiscontinued?: boolean;
  productName?: string;
  package?: string;
}

// ============================================
// TIPOS DE FILTROS / QUERY PARAMS
// ============================================
export interface OrderFilters {
  page?: number;
  limit?: number;
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  status?: OrderStatus;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  supplierId?: number;
  search?: string;
  discontinued?: boolean;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  country?: string;
  city?: string;
  search?: string;
}

// ============================================
// TIPOS DE UI
// ============================================
export interface StatusBadgeProps {
  status: OrderStatus;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface StatsCard {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

// ============================================
// HEALTH CHECK
// ============================================
export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp?: string;
  version?: string;
}