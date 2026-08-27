import api from './api';

export const analyticsService = {
  /**
   * Fetch analytics & reports data for selected timeframe
   * @param {Object} params - { timeframe: '7d' | '30d' | '90d' | '1y' }
   */
  getAnalyticsReports: async (params = {}) => {
    const response = await api.get('admin/analytics/reports', { params });
    return response.data;
  },
};

export default analyticsService;
