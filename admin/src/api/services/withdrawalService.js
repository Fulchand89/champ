import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const withdrawalService = {
  getWithdrawals: async (params = {}) => {
    const response = await api.get(API_ROUTES.WITHDRAWALS.GET_ALL, { params });
    return response.data;
  },

  getWithdrawalById: async (id) => {
    const response = await api.get(API_ROUTES.WITHDRAWALS.GET_BY_ID(id));
    return response.data;
  },

  verifyWithdrawal: async (id, { status, adminRemarks }) => {
    const response = await api.put(API_ROUTES.WITHDRAWALS.VERIFY(id), {
      status,
      adminRemarks,
    });
    return response.data;
  },
};

export default withdrawalService;
