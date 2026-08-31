import axios from 'axios';
import Cookies from 'js-cookie';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Safe production fallback (never use localhost in production)
  if (
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  ) {
    return 'https://backend-xi-nine-42.vercel.app/api/v1';
  }
  // Local development fallback
  return 'http://localhost:6060/api/v1';
};

const RAW_BASE_URL = getApiBaseUrl();
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

/**
 * Resolves uploaded backend image paths (/uploads/...) and public local assets safely
 */
export const getImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (typeof imgPath !== 'string') return '';
  if (
    imgPath.startsWith('data:') ||
    imgPath.startsWith('http://') ||
    imgPath.startsWith('https://') ||
    imgPath.startsWith('blob:')
  ) {
    return imgPath;
  }
  if (imgPath.startsWith('/uploads/') || imgPath.startsWith('uploads/')) {
    const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    const backendOrigin = RAW_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${backendOrigin}${cleanPath}`;
  }
  return imgPath;
};

// Request interceptor to inject JWT bearer token & adjust FormData headers
api.interceptors.request.use(
  (config) => {
    const token =
      Cookies.get('token') ||
      localStorage.getItem('token') ||
      Cookies.get('adminToken') ||
      localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // When sending FormData, delete Content-Type to let axios set multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401 errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const requestUrl = error.config?.url || '';

      // If token expired on protected admin endpoints (and not during login attempt)
      if (
        status === 401 &&
        !requestUrl.includes('login') &&
        !requestUrl.includes('public')
      ) {
        Cookies.remove('token');
        Cookies.remove('adminToken');
        Cookies.remove('user');
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');

        if (
          window.location.pathname.startsWith('/admin') &&
          !window.location.pathname.includes('/admin/login')
        ) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
