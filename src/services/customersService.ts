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
    return data;
  },

  // GET /api/v1/customers/:id
  getCustomerById: async (customerId: number): Promise<Customer> => {
    const { data } = await api.get(`/customers/${customerId}`);
    return data;
  },

  // POST /api/v1/customers
  createCustomer: async (payload: CreateCustomerRequest): Promise<Customer> => {
    const { data } = await api.post('/customers', payload);
    return data;
  },

  // PATCH /api/v1/customers/:id
  updateCustomer: async (customerId: number, payload: Partial<CreateCustomerRequest>): Promise<Customer> => {
    const { data } = await api.patch(`/customers/${customerId}`, payload);
    return data;
  },
};