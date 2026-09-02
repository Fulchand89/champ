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
 * Detects the real image MIME type from a base64 string by inspecting magic bytes.
 * Returns the corrected MIME type, or the original if it cannot be determined.
 */
const detectMimeFromBase64 = (base64Data, declaredMime) => {
  try {
    // Only need the first 12 bytes to identify all supported formats
    const sample = atob(base64Data.slice(0, 16));
    const b = (i) => sample.charCodeAt(i);

    // WebP: RIFF????WEBP  (bytes 0-3 = 52 49 46 46, bytes 8-11 = 57 45 42 50)
    if (
      b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 &&
      b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50
    ) return 'image/webp';

    // PNG: \x89PNG
    if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4E && b(3) === 0x47)
      return 'image/png';

    // JPEG: \xFF\xD8
    if (b(0) === 0xFF && b(1) === 0xD8)
      return 'image/jpeg';

    // GIF: GIF8
    if (b(0) === 0x47 && b(1) === 0x49 && b(2) === 0x46)
      return 'image/gif';

    // SVG: starts with '<' (after optional UTF-8 BOM)
    const text = sample.trimStart();
    if (text.startsWith('<'))
      return 'image/svg+xml';
  } catch (_) {
    // atob can throw on malformed base64 — fall through to declared
  }
  return declaredMime;
};

/**
 * Resolves image paths/data-URIs to displayable URLs.
 * - Corrects wrong MIME types in stored data URIs (e.g. WebP bytes stored as image/png).
 * - Resolves /uploads/ paths to full backend URLs.
 * - Returns empty string for null/invalid input so callers can use || fallback.
 */
export const getImageUrl = (imgPath) => {
  if (!imgPath || typeof imgPath !== 'string') return '';
  const cleanStr = imgPath.trim().replace(/[\r\n\s]+/g, '');
  if (!cleanStr) return '';

  // ── Data URI ────────────────────────────────────────────────────────────────
  if (cleanStr.startsWith('data:')) {
    const commaIdx = cleanStr.indexOf(',');
    if (commaIdx === -1) return ''; // malformed — no comma separator

    const header = cleanStr.slice(5, commaIdx);       // e.g. "image/png;base64"
    const base64Data = cleanStr.slice(commaIdx + 1);

    // Must have enough bytes to decode a real image header (at least 48 base64 chars = 36 bytes)
    if (!base64Data || base64Data.length < 48) return '';

    if (header.includes(';base64')) {
      // Detect truncation: a valid base64 string without padding will have length % 4 of 0, 2, or 3.
      // If it is 1, the string is definitely truncated or malformed.
      const stripped = base64Data.replace(/=+$/, '');
      if (stripped.length % 4 === 1) return ''; // truncated — drop it, use fallback image

      const declaredMime = header.split(';')[0].trim();
      const realMime = detectMimeFromBase64(base64Data, declaredMime);
      return `data:${realMime};base64,${base64Data}`;
    }
    return cleanStr;
  }

  // ── Absolute HTTP(S) / blob URL ──────────────────────────────────────────────
  if (
    cleanStr.startsWith('http://') ||
    cleanStr.startsWith('https://') ||
    cleanStr.startsWith('blob:')
  ) {
    return cleanStr;
  }

  // ── /uploads/ path — prefix with backend origin ──────────────────────────────
  if (cleanStr.startsWith('/uploads/') || cleanStr.startsWith('uploads/')) {
    const cleanPath = cleanStr.startsWith('/') ? cleanStr : `/${cleanStr}`;
    const backendOrigin = RAW_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${backendOrigin}${cleanPath}`;
  }

  // ── Public asset paths (e.g. /cat-sports.png) — return as-is ────────────────
  return cleanStr;
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
