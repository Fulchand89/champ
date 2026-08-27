import api from './api';

export const adminNotificationService = {
  /**
   * Get paginated notifications for logged in admin
   */
  async getNotifications(params = { page: 1, limit: 15 }) {
    const response = await api.get('admin/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('admin/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification(s) as read
   */
  async markAsRead(notificationId = null) {
    const response = await api.patch('admin/notifications/read', { notificationId });
    return response.data;
  },

  /**
   * Delete notification(s)
   */
  async deleteNotification(notificationId = null) {
    const response = await api.delete('admin/notifications', {
      params: notificationId ? { notificationId } : {},
    });
    return response.data;
  },
};

export default adminNotificationService;
