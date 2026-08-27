const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const PrizePoolTemplate = sequelize.define('PrizePoolTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  poolCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  distribution: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  minParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  platformFee: {
    type: DataTypes.STRING(20),
    defaultValue: '10%',
  },
  payoutStructure: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'prize_pool_templates',
  timestamps: true,
});

module.exports = PrizePoolTemplate;
