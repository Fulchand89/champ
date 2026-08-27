const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Feature = sequelize.define('Feature', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  iconName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  contestId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'contests',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  badgeText: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  colorClass: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'text-[#E94B4B]',
  },
}, {
  tableName: 'features',
  timestamps: true,
});

module.exports = Feature;
