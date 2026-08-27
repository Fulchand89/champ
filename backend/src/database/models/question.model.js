const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  questionType: {
    type: DataTypes.ENUM('single_choice', 'multiple_choice', 'true_false'),
    defaultValue: 'single_choice',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy',
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  negativePoints: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'questions',
  timestamps: true,
});

module.exports = Question;
