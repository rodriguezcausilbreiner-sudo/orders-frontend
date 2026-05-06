import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://orders-api-bb6h.onrender.com/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de respuesta para manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error de conexión con el servidor';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

export default api;