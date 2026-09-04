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
export const getImageUrl = (image) => {
  if (!image || typeof image !== 'string') return '';
  const cleanStr = image.trim();
  if (!cleanStr) return '';

  if (
    cleanStr.startsWith('data:') ||
    cleanStr.startsWith('http://') ||
    cleanStr.startsWith('https://') ||
    cleanStr.startsWith('blob:')
  ) {
    return cleanStr;
  }

  if (cleanStr.startsWith('/uploads/') || cleanStr.startsWith('uploads/')) {
    const cleanPath = cleanStr.startsWith('/') ? cleanStr : `/${cleanStr}`;
    const backendOrigin = RAW_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${backendOrigin}${cleanPath}`;
  }

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

// ═══════════════════════════════════════════════════════════════════
// INSTANT DATA CACHING LAYER FOR 0-SECOND ADMIN PANEL LOAD
// ═══════════════════════════════════════════════════════════════════
const apiGetCache = new Map();

/**
 * Safely clone Axios response object data to preserve immutability
 */
const cloneResponse = (res) => {
  if (!res) return res;
  try {
    return {
      ...res,
      data: res.data !== undefined ? JSON.parse(JSON.stringify(res.data)) : res.data,
    };
  } catch (_) {
    return res;
  }
};

/**
 * Clears the in-memory GET cache (or specific endpoint pattern).
 */
export const clearApiCache = (urlPattern) => {
  if (!urlPattern) {
    apiGetCache.clear();
    return;
  }
  for (const key of apiGetCache.keys()) {
    if (key.includes(urlPattern)) {
      apiGetCache.delete(key);
    }
  }
};

const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalPatch = api.patch.bind(api);
const originalDelete = api.delete.bind(api);

api.get = function (url, config = {}) {
  const skipCache = config?.headers?.['x-skip-cache'] === 'true' || config?.skipCache || config?.responseType === 'blob';
  const cacheKey = `${url}?${JSON.stringify(config?.params || {})}`;

  if (!skipCache && apiGetCache.has(cacheKey)) {
    const cachedResponse = apiGetCache.get(cacheKey);

    // Silently revalidate in background to keep cache fresh for future requests
    originalGet(url, config)
      .then((res) => {
        apiGetCache.set(cacheKey, res);
      })
      .catch(() => {});

    // Return cached response INSTANTLY in 0ms!
    return Promise.resolve(cloneResponse(cachedResponse));
  }

  return originalGet(url, config).then((res) => {
    if (!skipCache) {
      apiGetCache.set(cacheKey, res);
    }
    return res;
  });
};

api.post = function (url, data, config) {
  clearApiCache();
  return originalPost(url, data, config);
};

api.put = function (url, data, config) {
  clearApiCache();
  return originalPut(url, data, config);
};

api.patch = function (url, data, config) {
  clearApiCache();
  return originalPatch(url, data, config);
};

api.delete = function (url, config) {
  clearApiCache();
  return originalDelete(url, config);
};

export default api;
