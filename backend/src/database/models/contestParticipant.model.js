const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const ContestParticipant = sequelize.define('ContestParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  contestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('registered', 'joined', 'completed', 'disqualified'),
    defaultValue: 'registered',
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  questionsAttempted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'contest_participants',
  timestamps: true,
});

module.exports = ContestParticipant;
