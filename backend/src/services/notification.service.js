const { Notification, User } = require('../database');
const { getIO } = require('../config/socket');
const fs = require('fs');
const path = require('path');

const notificationsFilePath = path.join(__dirname, '../database/notifications.json');

const readJsonFile = (filePath, defaultVal = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), 'utf-8');
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return defaultVal;
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Failed to write JSON file ${filePath}:`, err);
  }
};

class NotificationService {
  /**
   * Create a dynamic notification, save to MySQL DB & JSON backup, and broadcast via WebSocket
   */
  async createNotification({ userId = null, targetRole = 'admin', type = 'system', title, message, data = null }) {
    try {
      let createdNotif = null;

      // 1. Save to Database
      try {
        createdNotif = await Notification.create({
          userId,
          targetRole,
          type,
          title,
          message,
          isRead: false,
          data,
        });
      } catch (dbErr) {
        console.warn('Notification DB insert warning (fallback to JSON):', dbErr.message);
      }

      const notifPayload = createdNotif ? createdNotif.toJSON() : {
        id: Date.now().toString(),
        userId,
        targetRole,
        type,
        title,
        message,
        isRead: false,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Also keep notifications.json synced
      const jsonNotifs = readJsonFile(notificationsFilePath, []);
      jsonNotifs.unshift(notifPayload);
      if (jsonNotifs.length > 200) jsonNotifs.pop(); // keep last 200 in file
      writeJsonFile(notificationsFilePath, jsonNotifs);

      // 3. Real-time WebSocket Broadcast
      try {
        const io = getIO();
        if (io) {
          // Broadcast to admin room
          io.emit('new_admin_notification', notifPayload);
          io.emit('new_notification', notifPayload);
          io.emit('admin_notification_update', { count: jsonNotifs.filter(n => !n.isRead).length });
        }
      } catch (socketErr) {
        // Socket broadcast optional
      }

      return notifPayload;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  }

  /**
   * Get paginated notifications from Database or JSON
   */
  async getNotifications({ page = 1, limit = 15, targetRole = 'admin' }) {
    try {
      const offset = (page - 1) * limit;

      try {
        const { count, rows } = await Notification.findAndCountAll({
          where: targetRole === 'all' ? {} : { targetRole },
          order: [['createdAt', 'DESC']],
          limit,
          offset,
        });

        const unreadCount = await Notification.count({
          where: { targetRole, isRead: false },
        });

        return {
          notifications: rows.map(r => r.toJSON()),
          unreadCount,
          pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / limit) || 1,
            currentPage: page,
            limit,
          },
        };
      } catch (dbErr) {
        // Fallback to JSON file
        const all = readJsonFile(notificationsFilePath, []);
        all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const paginated = all.slice(offset, offset + limit);
        const unreadCount = all.filter(n => !n.isRead).length;

        return {
          notifications: paginated,
          unreadCount,
          pagination: {
            totalItems: all.length,
            totalPages: Math.ceil(all.length / limit) || 1,
            currentPage: page,
            limit,
          },
        };
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return { notifications: [], unreadCount: 0, pagination: { totalItems: 0, totalPages: 1, currentPage: 1, limit } };
    }
  }

  /**
   * Mark single or all notifications as read
   */
  async markAsRead(notificationId = null) {
    try {
      if (notificationId) {
        try {
          await Notification.update({ isRead: true }, { where: { id: notificationId } });
        } catch (e) {}

        const all = readJsonFile(notificationsFilePath, []);
        const idx = all.findIndex(n => String(n.id) === String(notificationId));
        if (idx !== -1) {
          all[idx].isRead = true;
          writeJsonFile(notificationsFilePath, all);
        }
      } else {
        try {
          await Notification.update({ isRead: true }, { where: { isRead: false } });
        } catch (e) {}

        const all = readJsonFile(notificationsFilePath, []);
        all.forEach(n => { n.isRead = true; });
        writeJsonFile(notificationsFilePath, all);
      }

      // Broadcast unread count
      try {
        const io = getIO();
        if (io) {
          io.emit('unread_count_update', { count: 0 });
        }
      } catch (e) {}

      return true;
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      return false;
    }
  }

  /**
   * Delete single or all notifications
   */
  async deleteNotifications(notificationId = null) {
    try {
      if (notificationId) {
        try {
          await Notification.destroy({ where: { id: notificationId } });
        } catch (e) {}

        let all = readJsonFile(notificationsFilePath, []);
        all = all.filter(n => String(n.id) !== String(notificationId));
        writeJsonFile(notificationsFilePath, all);
      } else {
        try {
          await Notification.destroy({ where: {}, truncate: true });
        } catch (e) {}

        writeJsonFile(notificationsFilePath, []);
      }
      return true;
    } catch (err) {
      console.error('Error deleting notifications:', err);
      return false;
    }
  }
}

module.exports = new NotificationService();
