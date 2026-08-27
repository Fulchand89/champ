const { sequelize } = require('../config/db');
const User = require('./models/user.model');
const Category = require('./models/category.model');
const Subject = require('./models/subject.model');
const Topic = require('./models/topic.model');
const Contest = require('./models/contest.model');
const Feature = require('./models/feature.model');
const FAQ = require('./models/faq.model');
const FeeTier = require('./models/feeTier.model');
const PrizePoolTemplate = require('./models/prizePoolTemplate.model');
const ContestParticipant = require('./models/contestParticipant.model');
const Question = require('./models/question.model');
const QuestionOption = require('./models/questionOption.model');
const Transaction = require('./models/transaction.model')(sequelize);
const Withdrawal = require('./models/withdrawal.model')(sequelize);
const Notification = require('./models/notification.model');

// User <-> Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Withdrawal
User.hasMany(Withdrawal, { foreignKey: 'userId', as: 'withdrawals' });
Withdrawal.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Withdrawal.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });
Withdrawal.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Category <-> Subject <-> Topic
Category.hasMany(Subject, { foreignKey: 'categoryId', as: 'subjects' });
Subject.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Subject.hasMany(Topic, { foreignKey: 'subjectId', as: 'topics' });
Topic.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Category / Subject / Topic <-> Contest
Category.hasMany(Contest, { foreignKey: 'categoryId', as: 'contests' });
Contest.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Subject.hasMany(Contest, { foreignKey: 'subjectId', as: 'contests' });
Contest.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Topic.hasMany(Contest, { foreignKey: 'topicId', as: 'contests' });
Contest.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

// Contest <-> Feature
Contest.hasMany(Feature, { foreignKey: 'contestId', as: 'features' });
Feature.belongsTo(Contest, { foreignKey: 'contestId', as: 'contest' });

// Contest <-> FAQ
Contest.hasMany(FAQ, { foreignKey: 'contestId', as: 'faqs' });
FAQ.belongsTo(Contest, { foreignKey: 'contestId', as: 'contest' });

// Contest <-> ContestParticipant <-> User
Contest.hasMany(ContestParticipant, { foreignKey: 'contestId', as: 'participants' });
ContestParticipant.belongsTo(Contest, { foreignKey: 'contestId', as: 'contest' });

User.hasMany(ContestParticipant, { foreignKey: 'userId', as: 'participations' });
ContestParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Category / Subject / Topic <-> Question
Category.hasMany(Question, { foreignKey: 'categoryId', as: 'questions' });
Question.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Subject.hasMany(Question, { foreignKey: 'subjectId', as: 'questions' });
Question.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Topic.hasMany(Question, { foreignKey: 'topicId', as: 'questions' });
Question.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

// Question <-> QuestionOption
Question.hasMany(QuestionOption, { foreignKey: 'questionId', as: 'options', onDelete: 'CASCADE' });
QuestionOption.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Category,
  Subject,
  Topic,
  Contest,
  Feature,
  FAQ,
  FeeTier,
  PrizePoolTemplate,
  ContestParticipant,
  Question,
  QuestionOption,
  Transaction,
  Withdrawal,
  Notification,
};