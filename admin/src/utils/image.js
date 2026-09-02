const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  if (
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  ) {
    return 'https://backend-xi-nine-42.vercel.app';
  }
  return 'http://localhost:6060';
};

const BACKEND_BASE_URL = getBackendBaseUrl();

/**
 * Formats a relative upload image path to a full backend URL.
 * @param {string} url - Relative path (e.g. /uploads/profile_pics/pic.webp) or full HTTP URL.
 * @returns {string|null} Full image URL.
 */
export const getImageUrl = (urlOrObj) => {
  if (!urlOrObj) return null;
  const url = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj?.url || urlOrObj?.path || urlOrObj?.file;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

export default getImageUrl;
