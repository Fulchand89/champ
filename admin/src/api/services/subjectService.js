import api from './api';

export const subjectService = {
  getSubjects: async (categoryId = null) => {
    const params = categoryId ? { categoryId } : {};
    const response = await api.get('/admin/subjects', { params });
    return response.data;
  },

  createSubject: async (data) => {
    const response = await api.post('/admin/subjects', data);
    return response.data;
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/admin/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/admin/subjects/${id}`);
    return response.data;
  },
};

export default subjectService;
