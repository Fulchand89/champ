const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6060';

/**
 * Formats a relative upload image path to a full backend URL.
 * @param {string} url - Relative path (e.g. /uploads/profile_pics/pic.webp) or full HTTP URL.
 * @returns {string|null} Full image URL.
 */
export const getImageUrl = (urlOrObj) => {
  if (!urlOrObj) return null;
  const url = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj?.url || urlOrObj?.path || urlOrObj?.file;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
};

export default getImageUrl;
