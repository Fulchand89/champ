import api from './api';

export const systemSettingsService = {
  /**
   * Fetch system settings (logo, platform name, notification alerts)
   */
  async getSettings() {
    const response = await api.get('admin/settings');
    return response.data;
  },

  /**
   * Update system settings (FormData for optional logo file + settings fields)
   */
  async updateSettings(formData) {
    const response = await api.put('admin/settings', formData, {
      headers: {
        'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return response.data;
  },
};

export default systemSettingsService;
