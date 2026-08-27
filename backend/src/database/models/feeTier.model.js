const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const FeeTier = sequelize.define('FeeTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tierCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  tierName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  entryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  entryCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  platformCut: {
    type: DataTypes.STRING(20),
    defaultValue: '10%',
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
}, {
  tableName: 'fee_tiers',
  timestamps: true,
});

module.exports = FeeTier;
