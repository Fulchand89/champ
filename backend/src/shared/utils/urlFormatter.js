const env = require('../../config/env');

/**
 * Format a relative file path into a complete absolute URL pointing to the backend host.
 * If the path is already an absolute HTTP/HTTPS URL or base64 data URI, it is returned unchanged.
 * 
 * @param {string} path - Relative file path (e.g. '/uploads/profile_pics/pic.jpg')
 * @returns {string|null} - Full URL or null if empty
 */
const formatUrl = (path) => {
  if (!path) return null;
  if (typeof path !== 'string') return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = (env.app && env.app.baseUrl) 
    ? env.app.baseUrl.replace(/\/+$/, '') 
    : `http://localhost:${env.port || 6060}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Format an array or JSON string of image paths into absolute backend URLs.
 * 
 * @param {Array|string} images - List of image paths or stringified JSON
 * @returns {Array<string>} - Array of full URLs
 */
const formatImageList = (images) => {
  if (!images) return [];
  let list = images;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [list];
    }
  }
  if (!Array.isArray(list)) list = [list];
  return list.filter(Boolean).map(img => formatUrl(img));
};

module.exports = {
  formatUrl,
  formatImageList,
};
