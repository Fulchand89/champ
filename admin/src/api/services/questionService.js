import api from './api';
import { API_ROUTES } from '../constants/apiRoutes';

export const questionService = {
  getQuestions: async (params = {}) => {
    const response = await api.get(API_ROUTES.QUESTIONS.GET_ALL, { params });
    return response.data;
  },

  getQuestionById: async (id) => {
    const response = await api.get(API_ROUTES.QUESTIONS.GET_BY_ID(id));
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await api.post(API_ROUTES.QUESTIONS.CREATE, data);
    return response.data;
  },

  updateQuestion: async (id, data) => {
    const response = await api.put(API_ROUTES.QUESTIONS.UPDATE(id), data);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(API_ROUTES.QUESTIONS.DELETE(id));
    return response.data;
  },

  uploadQuestions: async (formData) => {
    const response = await api.post(API_ROUTES.QUESTIONS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get(API_ROUTES.QUESTIONS.TEMPLATE_CSV, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'question_bank_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },
};

export default questionService;
