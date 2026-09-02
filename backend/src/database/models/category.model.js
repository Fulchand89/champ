const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: null,
    comment: 'URL/path or Base64 Data URI of the uploaded category image',
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '📚',
    comment: 'Fallback icon or emoji',
  },
  colorClass: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]',
    comment: 'Tailwind borderGlowClass for category card hover effect',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;
