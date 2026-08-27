import api from './api';

export const featureService = {
  getPublicFeatures: async (contestId) => {
    const response = await api.get('/public/features', {
      params: contestId ? { contestId } : {},
    });
    return response.data;
  },

  getFeatures: async (contestId) => {
    const response = await api.get('/admin/features', {
      params: contestId ? { contestId } : {},
    });
    return response.data;
  },

  createFeature: async (data) => {
    const response = await api.post('/admin/features', data);
    return response.data;
  },

  updateFeature: async (id, data) => {
    const response = await api.put(`/admin/features/${id}`, data);
    return response.data;
  },

  deleteFeature: async (id) => {
    const response = await api.delete(`/admin/features/${id}`);
    return response.data;
  },
};

export default featureService;
