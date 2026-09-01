import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const analyticsService = {
  /**
   * Fetch analytics & reports data for selected timeframe
   */
  getAnalyticsReports: async (params = {}) => {
    const response = await api.get(API_ROUTES.ANALYTICS.GET_REPORTS, { params });
    return response.data;
  },

  /**
   * 1. User Participation Report
   */
  getUserParticipationReport: async (params = {}) => {
    const response = await api.get(API_ROUTES.ANALYTICS.USER_PARTICIPATION, { params });
    return response.data;
  },

  /**
   * 2. Contest Report
   */
  getContestReport: async (params = {}) => {
    const response = await api.get(API_ROUTES.ANALYTICS.CONTEST_REPORT, { params });
    return response.data;
  },

  /**
   * 3. Contest-wise Payment Report
   */
  getContestPaymentReport: async (params = {}) => {
    const response = await api.get(API_ROUTES.ANALYTICS.CONTEST_PAYMENTS, { params });
    return response.data;
  },

  /**
   * 4. Financial Report
   */
  getFinancialReport: async (params = {}) => {
    const response = await api.get(API_ROUTES.ANALYTICS.FINANCIAL_REPORT, { params });
    return response.data;
  },

  /**
   * 5. Contest Result Report
   */
  getContestResultReport: async (params = {}) => {
    const response = await api.get(API_ROUTES.ANALYTICS.CONTEST_RESULTS, { params });
    return response.data;
  },
};

export default analyticsService;
