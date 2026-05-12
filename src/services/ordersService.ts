import api from './api';
import {
  Order,
  OrderItem,
  OrderFilters,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateOrderItemRequest,
  UpdateOrderItemRequest,
  PaginatedResponse,
} from '@/types';

export const ordersService = {
  // GET /api/v1/orders
  getOrders: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const { data } = await api.get('/orders', { params: filters });
    
    // Normalización de respuesta API
    if (data.data && Array.isArray(data.data)) {
      return {
        data: data.data,
        meta: {
          total: data.total || data.data.length,
          page: data.page || 1,
          limit: data.limit || 10,
          totalPages: Math.ceil((data.total || data.data.length) / (data.limit || 10))
        }
      };
    }

    if (Array.isArray(data)) {
      return { data, meta: { total: data.length, page: 1, limit: filters?.limit ?? 10, totalPages: 1 } };
    }
    return data;
  },

  // GET /api/v1/orders/:id
  getOrderById: async (orderId: string | number): Promise<Order> => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },

  // POST /api/v1/orders
  createOrder: async (payload: CreateOrderRequest): Promise<Order> => {
    const { data } = await api.post('/orders', payload);
    return data;
  },

  // PUT /api/v1/orders/:id
  replaceOrder: async (orderId: string | number, payload: Order): Promise<Order> => {
    const { data } = await api.put(`/orders/${orderId}`, payload);
    return data;
  },

  // PATCH /api/v1/orders/:id
  updateOrder: async (orderId: string | number, payload: UpdateOrderRequest): Promise<Order> => {
    const { data } = await api.patch(`/orders/${orderId}`, payload);
    return data;
  },

  // DELETE /api/v1/orders/:id
  deleteOrder: async (orderId: string | number): Promise<void> => {
    await api.delete(`/orders/${orderId}`);
  },

  // GET /api/v1/orders/:id/items
  getOrderItems: async (orderId: string | number): Promise<OrderItem[]> => {
    const { data } = await api.get(`/orders/${orderId}/items`);
    return data;
  },

  // POST /api/v1/orders/:id/items
  addOrderItem: async (orderId: string | number, payload: CreateOrderItemRequest): Promise<OrderItem> => {
    const { data } = await api.post(`/orders/${orderId}/items`, payload);
    return data;
  },

  // PATCH /api/v1/orders/:id/items/:itemId
  updateOrderItem: async (
    orderId: string | number,
    itemId: number,
    payload: UpdateOrderItemRequest
  ): Promise<OrderItem> => {
    const { data } = await api.patch(`/orders/${orderId}/items/${itemId}`, payload);
    return data;
  },

  // DELETE /api/v1/orders/:id/items/:itemId
  deleteOrderItem: async (orderId: string | number, itemId: number): Promise<void> => {
    await api.delete(`/orders/${orderId}/items/${itemId}`);
  },
};