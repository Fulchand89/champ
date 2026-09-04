import api from './api';

export const cmsService = {
  // Public CMS methods
  getPublicLeaderboard: async () => {
    const response = await api.get('/public/cms/leaderboard');
    return response.data;
  },

  getPublicExcellenceLeague: async () => {
    const response = await api.get('/public/cms/excellence-league');
    return response.data;
  },

  getPublicHowItWorks: async () => {
    const response = await api.get('/public/cms/how-it-works');
    return response.data;
  },

  // Admin CMS methods
  getAdminLeaderboard: async () => {
    const response = await api.get('/admin/cms/leaderboard');
    return response.data;
  },

  updateAdminLeaderboard: async (data) => {
    const response = await api.put('/admin/cms/leaderboard', data);
    return response.data;
  },

  getAdminExcellenceLeague: async () => {
    const response = await api.get('/admin/cms/excellence-league');
    return response.data;
  },

  updateAdminExcellenceLeague: async (data) => {
    const response = await api.put('/admin/cms/excellence-league', data);
    return response.data;
  },

  getAdminHowItWorks: async () => {
    const response = await api.get('/admin/cms/how-it-works');
    return response.data;
  },

  updateAdminHowItWorks: async (data) => {
    const response = await api.put('/admin/cms/how-it-works', data);
    return response.data;
  },
};

export default cmsService;

