const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Withdrawal = sequelize.define(
    'Withdrawal',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      withdrawalId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      payoutMethod: {
        type: DataTypes.ENUM('upi', 'bank_transfer'),
        allowNull: false,
        defaultValue: 'upi',
      },
      payoutDetails: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processing', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      adminRemarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transactionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id',
        },
      },
    },
    {
      tableName: 'withdrawals',
      timestamps: true,
    }
  );

  return Withdrawal;
};
