import api from './api';

export const contestService = {
  // ── Public APIs ──
  getPublicContests: async () => {
    const response = await api.get('/public/contests');
    return response.data;
  },

  // ── 1. Contest CRUD ──
  getContests: async (params = {}) => {
    const response = await api.get('/admin/contests', { params });
    return response.data;
  },

  getContestById: async (id) => {
    const response = await api.get(`/admin/contests/${id}`);
    return response.data;
  },

  createContest: async (data) => {
    const response = await api.post('/admin/contests', data);
    return response.data;
  },

  updateContest: async (id, data) => {
    const response = await api.put(`/admin/contests/${id}`, data);
    return response.data;
  },

  deleteContest: async (id) => {
    const response = await api.delete(`/admin/contests/${id}`);
    return response.data;
  },

  // ── 2. Schedule Contest APIs ──
  getScheduledContests: async (params = {}) => {
    const response = await api.get('/admin/contests/scheduled', { params });
    return response.data;
  },

  getContestSchedule: async (id) => {
    const response = await api.get(`/admin/contests/${id}/schedule`);
    return response.data;
  },

  saveContestSchedule: async (id, data) => {
    const response = await api.put(`/admin/contests/${id}/schedule`, data);
    return response.data;
  },

  cancelContestSchedule: async (id) => {
    const response = await api.delete(`/admin/contests/${id}/schedule`);
    return response.data;
  },

  // ── 3. Configure Entry Fee APIs ──
  getContestEntryFee: async (id) => {
    const response = await api.get(`/admin/contests/${id}/entry-fee`);
    return response.data;
  },

  saveContestEntryFee: async (id, data) => {
    const response = await api.put(`/admin/contests/${id}/entry-fee`, data);
    return response.data;
  },

  getEntryFeeTiers: async () => {
    const response = await api.get('/admin/entry-fee-tiers');
    return response.data;
  },

  createEntryFeeTier: async (data) => {
    const response = await api.post('/admin/entry-fee-tiers', data);
    return response.data;
  },

  updateEntryFeeTier: async (id, data) => {
    const response = await api.put(`/admin/entry-fee-tiers/${id}`, data);
    return response.data;
  },

  deleteEntryFeeTier: async (id) => {
    const response = await api.delete(`/admin/entry-fee-tiers/${id}`);
    return response.data;
  },

  // ── 4. Configure Prize Pool APIs ──
  getContestPrizePool: async (id) => {
    const response = await api.get(`/admin/contests/${id}/prize-pool`);
    return response.data;
  },

  saveContestPrizePool: async (id, data) => {
    const response = await api.put(`/admin/contests/${id}/prize-pool`, data);
    return response.data;
  },

  deleteContestPrizePool: async (id) => {
    const response = await api.delete(`/admin/contests/${id}/prize-pool`);
    return response.data;
  },

  getPrizeTemplates: async () => {
    const response = await api.get('/admin/prize-templates');
    return response.data;
  },

  createPrizeTemplate: async (data) => {
    const response = await api.post('/admin/prize-templates', data);
    return response.data;
  },

  updatePrizeTemplate: async (id, data) => {
    const response = await api.put(`/admin/prize-templates/${id}`, data);
    return response.data;
  },

  deletePrizeTemplate: async (id) => {
    const response = await api.delete(`/admin/prize-templates/${id}`);
    return response.data;
  },

  // ── 5. Monitor Live Contest APIs ──
  getLiveContests: async () => {
    const response = await api.get('/admin/contests/live');
    return response.data;
  },

  getLiveContestDetails: async (id) => {
    const response = await api.get(`/admin/contests/${id}/live`);
    return response.data;
  },

  getContestParticipants: async (id) => {
    const response = await api.get(`/admin/contests/${id}/participants`);
    return response.data;
  },

  getContestResults: async (id) => {
    const response = await api.get(`/admin/contests/${id}/results`);
    return response.data;
  },

  getContestStatistics: async (id) => {
    const response = await api.get(`/admin/contests/${id}/statistics`);
    return response.data;
  },
};

export default contestService;
