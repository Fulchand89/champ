import api from './api';

class UserService {
  async getUsers(params) {
    const response = await api.get('admin/users', { params });
    return response.data;
  }

  async getUserById(id) {
    const response = await api.get(`admin/users/${id}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await api.post('admin/users', userData);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await api.put(`admin/users/${id}`, userData);
    return response.data;
  }

  async toggleUserStatus(id) {
    const response = await api.patch(`admin/users/${id}/toggle-status`);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`admin/users/${id}`);
    return response.data;
  }
}

export default new UserService();
