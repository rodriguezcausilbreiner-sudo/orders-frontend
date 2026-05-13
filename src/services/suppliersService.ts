import api from './api';
import {
  Supplier,
  SupplierFilters,
  PaginatedResponse,
  Product,
} from '@/types';

export const suppliersService = {
  // GET /api/v1/suppliers
  getSuppliers: async (filters?: SupplierFilters): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await api.get('/suppliers', { params: filters });
    
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

  // POST /api/v1/suppliers
  createSupplier: async (payload: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await api.post('/suppliers', payload);
    return data;
  },

  // GET /api/v1/suppliers/:id
  getSupplierById: async (supplierId: number): Promise<Supplier> => {
    const { data } = await api.get(`/suppliers/${supplierId}`);
    return data;
  },

  // PATCH /api/v1/suppliers/:id
  updateSupplier: async (supplierId: number, payload: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await api.patch(`/suppliers/${supplierId}`, payload);
    return data;
  },

  // GET /api/v1/suppliers/:id/products
  getSupplierProducts: async (supplierId: number): Promise<Product[]> => {
    const { data } = await api.get(`/suppliers/${supplierId}/products`);
    return data;
  },
};
