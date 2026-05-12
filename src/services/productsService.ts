import api from './api';
import {
  Product,
  ProductFilters,
  UpdateProductRequest,
  PaginatedResponse,
} from '@/types';

export const productsService = {
  // GET /api/v1/products
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get('/products', { params: filters });
    
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

  // GET /api/v1/products/:id
  getProductById: async (productId: number): Promise<Product> => {
    const { data } = await api.get(`/products/${productId}`);
    return data;
  },

  // PATCH /api/v1/products/:id
  updateProduct: async (productId: number, payload: UpdateProductRequest): Promise<Product> => {
    const { data } = await api.patch(`/products/${productId}`, payload);
    return data;
  },

  // DELETE /api/v1/products/:id
  deleteProduct: async (productId: number): Promise<void> => {
    await api.delete(`/products/${productId}`);
  },

  toggleDiscontinued: async (productId: number): Promise<Product> => {
    const product = await productsService.getProductById(productId);
    const { data } = await api.patch(`/products/${productId}`, { isDiscontinued: !product.isDiscontinued });
    return data;
  },
};