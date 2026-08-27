const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
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
}, {
  tableName: 'faqs',
  timestamps: true,
});

module.exports = FAQ;
