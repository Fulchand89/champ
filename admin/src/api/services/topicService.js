import api from './api';

export const topicService = {
  getTopics: async (subjectId = null) => {
    const params = subjectId ? { subjectId } : {};
    const response = await api.get('/admin/topics', { params });
    return response.data;
  },

  createTopic: async (data) => {
    const response = await api.post('/admin/topics', data);
    return response.data;
  },

  updateTopic: async (id, data) => {
    const response = await api.put(`/admin/topics/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id) => {
    const response = await api.delete(`/admin/topics/${id}`);
    return response.data;
  },
};

export default topicService;
