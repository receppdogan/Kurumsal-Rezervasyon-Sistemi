import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Companies
export const companyAPI = {
  create: (data) => api.post('/companies', data),
  getAll: () => api.get('/companies'),
  getById: (id) => api.get(`/companies/${id}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
};

// Hotels
export const hotelAPI = {
  search: (params) => api.post('/hotels/search', params),
  getById: (id) => api.get(`/hotels/${id}`),
};

// Reservations
export const reservationAPI = {
  create: (data) => api.post('/reservations', data),
  getAll: (status) => api.get('/reservations', { params: { status } }),
  getById: (id) => api.get(`/reservations/${id}`),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  approve: (id) => api.put(`/reservations/${id}`, { status: 'approved' }),
  reject: (id, reason) => api.put(`/reservations/${id}`, { 
    status: 'rejected',
    rejection_reason: reason 
  }),
  cancel: (id, reason) => api.put(`/reservations/${id}`, { 
    status: 'cancelled',
    cancellation_reason: reason 
  }),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Users
export const userAPI = {
  getAll: () => api.get('/users'),
};

export default api;
