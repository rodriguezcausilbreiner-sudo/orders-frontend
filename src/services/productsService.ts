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
};