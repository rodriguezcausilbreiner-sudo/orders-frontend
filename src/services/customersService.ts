import api from './api';
import {
  Customer,
  CustomerFilters,
  CreateCustomerRequest,
  PaginatedResponse,
} from '@/types';

export const customersService = {
  // GET /api/v1/customers
  getCustomers: async (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> => {
    const { data } = await api.get('/customers', { params: filters });
    
    // Normalización de respuesta API (total, page, limit en raíz -> meta)
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

  // GET /api/v1/customers/:id
  getCustomerById: async (customerId: string | number): Promise<Customer> => {
    const { data } = await api.get(`/customers/${customerId}`);
    return data;
  },

  // POST /api/v1/customers
  createCustomer: async (payload: CreateCustomerRequest): Promise<Customer> => {
    const { data } = await api.post('/customers', payload);
    return data;
  },

  // PATCH /api/v1/customers/:id
  updateCustomer: async (customerId: string | number, payload: Partial<CreateCustomerRequest>): Promise<Customer> => {
    const { data } = await api.patch(`/customers/${customerId}`, payload);
    return data;
  },

  // DELETE /api/v1/customers/:id
  deleteCustomer: async (customerId: string | number): Promise<void> => {
    await api.delete(`/customers/${customerId}`);
  },
};