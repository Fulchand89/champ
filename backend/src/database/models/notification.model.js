const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  targetRole: {
    type: DataTypes.ENUM('all', 'admin', 'user'),
    defaultValue: 'admin',
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'system',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'targetRole', 'isRead'],
    },
  ],
});

module.exports = Notification;
