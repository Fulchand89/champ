const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Contest = sequelize.define('Contest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    comment: 'URL/path of the uploaded contest image',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'upcoming', 'live', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  registrationStart: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  registrationEnd: {
    type: DataTypes.DATE,
    allowNull: true,
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
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00,
  },
  prizePool: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  minParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15,
  },
  durationPerQuestion: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    comment: 'Duration per question in seconds',
  },
  numQuestions: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  prizeDistribution: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'contests',
  timestamps: true,
});

module.exports = Contest;
