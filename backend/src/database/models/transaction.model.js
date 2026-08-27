const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      txnId: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM('entry_fee', 'coins_pack', 'deposit', 'withdrawal', 'prize_payout', 'refund'),
        allowNull: false,
        defaultValue: 'deposit',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'INR',
      },
      paymentMethod: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: 'UPI',
      },
      paymentGateway: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: 'Razorpay',
      },
      gatewayTxnId: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('successful', 'pending', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'transactions',
      timestamps: true,
    }
  );

  return Transaction;
};
