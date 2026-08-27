import api from './api';

export const faqService = {
  getPublicFaq: async (contestId) => {
    const response = await api.get('/public/faq', {
      params: contestId ? { contestId } : {},
    });
    return response.data;
  },

  getFAQs: async (contestId) => {
    const response = await api.get('/admin/faq', {
      params: contestId ? { contestId } : {},
    });
    return response.data;
  },

  createFAQ: async (data) => {
    const response = await api.post('/admin/faq', data);
    return response.data;
  },

  updateFAQ: async (id, data) => {
    const response = await api.put(`/admin/faq/${id}`, data);
    return response.data;
  },

  deleteFAQ: async (id) => {
    const response = await api.delete(`/admin/faq/${id}`);
    return response.data;
  },
};

export default faqService;
