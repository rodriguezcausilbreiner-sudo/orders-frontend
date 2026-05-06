import api from './api';
import { HealthStatus } from '@/types';

export const healthService = {
  // GET /api/v1/health
  getHealth: async (): Promise<HealthStatus> => {
    const { data } = await api.get('/health');
    return data;
  },
};