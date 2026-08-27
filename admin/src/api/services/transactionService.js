import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const transactionService = {
  getTransactions: async (params = {}) => {
    const response = await api.get(API_ROUTES.TRANSACTIONS.GET_ALL, { params });
    return response.data;
  },

  getTransactionById: async (id) => {
    const response = await api.get(API_ROUTES.TRANSACTIONS.GET_BY_ID(id));
    return response.data;
  },

  createTransaction: async (data) => {
    const response = await api.post(API_ROUTES.TRANSACTIONS.CREATE, data);
    return response.data;
  },

  exportCsv: async (params = {}) => {
    const response = await api.get(API_ROUTES.TRANSACTIONS.EXPORT_CSV, {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
};

export default transactionService;
