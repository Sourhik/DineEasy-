import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token & active restaurant ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dineeasy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const activeRestId = localStorage.getItem('dineeasy_active_restaurant_id');
    if (activeRestId) {
      config.headers['x-restaurant-id'] = activeRestId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: handle auto-logout if token is expired
    }
    return Promise.reject(error);
  }
);

export default api;

