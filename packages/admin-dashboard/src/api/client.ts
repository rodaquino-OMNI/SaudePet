import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/admin/auth/login', { email, password }),
};

// Users API
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/users', { params }),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/users/${id}`, data),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
};

// Pets API
export const petsApi = {
  getAll: (params?: { page?: number; limit?: number; userId?: string }) =>
    api.get('/admin/pets', { params }),
  getById: (id: string) => api.get(`/admin/pets/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/pets/${id}`, data),
};

// Consultations API
export const consultationsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/consultations', { params }),
  getById: (id: string) => api.get(`/admin/consultations/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/consultations/${id}`, data),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/subscriptions', { params }),
  getById: (id: string) => api.get(`/admin/subscriptions/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/subscriptions/${id}`, data),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get('/admin/analytics/dashboard'),
  getConsultationStats: (period: string) =>
    api.get('/admin/analytics/consultations', { params: { period } }),
  getUserGrowth: (period: string) =>
    api.get('/admin/analytics/users', { params: { period } }),
  getRevenue: (period: string) =>
    api.get('/admin/analytics/revenue', { params: { period } }),
};
