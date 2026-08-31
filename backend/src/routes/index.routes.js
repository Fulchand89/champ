const express = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');


const router = express.Router();

// Normalize any duplicated /public/public segments cleanly
router.use((req, res, next) => {
  if (req.url && req.url.includes('/public/public')) {
    req.url = req.url.replace(/\/public\/public/g, '/public');
  }
  next();
});

// Base API Route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Quiz App API is running"
  });
});

// Health Check Route
router.get('/health', async (req, res) => {
  try {
    const { sequelize } = require('../database');
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// Role-based Modular Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Public Content Endpoints
const { Category, Contest, Feature, FAQ } = require('../database');

router.get('/public/faq', async (req, res) => {
  try {
    const { contestId } = req.query;
    const whereClause = { isActive: true };
    if (contestId) {
      whereClause.contestId = parseInt(contestId, 10);
    }
    const faqs = await FAQ.findAll({
      where: whereClause,
      order: [['displayOrder', 'ASC'], ['id', 'ASC']],
      include: [{ model: Contest, as: 'contest', attributes: ['id', 'title'] }]
    });

    return res.status(200).json({
      success: true,
      data: Array.isArray(faqs) ? faqs : []
    });
  } catch (error) {
    console.error('PUBLIC FAQ ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs'
    });
  }
});

router.get('/public/features', async (req, res) => {
  try {
    const { contestId } = req.query;
    const whereClause = { isActive: true };
    if (contestId) {
      whereClause.contestId = parseInt(contestId, 10);
    }
    const features = await Feature.findAll({
      where: whereClause,
      order: [['displayOrder', 'ASC'], ['id', 'ASC']],
      include: [{ model: Contest, as: 'contest', attributes: ['id', 'title'] }]
    });

    return res.status(200).json({
      success: true,
      data: Array.isArray(features) ? features : []
    });
  } catch (error) {
    console.error('PUBLIC FEATURES ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch features'
    });
  }
});

router.get('/public/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: Array.isArray(categories) ? categories : []
    });
  } catch (error) {
    console.error('PUBLIC CATEGORIES ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

router.get('/public/contests', async (req, res) => {
  try {
    const contests = await Contest.findAll({ 
      where: { isActive: true },
      order: [['startTime', 'ASC'], ['id', 'ASC']],
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'image', 'icon', 'colorClass'] }]
    });

    return res.status(200).json({
      success: true,
      data: Array.isArray(contests) ? contests : []
    });
  } catch (error) {
    console.error('PUBLIC CONTESTS ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contests'
    });
  }
});

router.get('/public/contests/:id/questions', async (req, res, next) => {
  try {
    const { Question, QuestionOption } = require('../database');
    const contest = await Contest.findByPk(req.params.id);
    let whereClause = { isActive: true };
    if (contest) {
      if (contest.topicId) {
        whereClause.topicId = contest.topicId;
      } else if (contest.subjectId) {
        whereClause.subjectId = contest.subjectId;
      } else if (contest.categoryId) {
        whereClause.categoryId = contest.categoryId;
      }
    }

    let questions = await Question.findAll({
      where: whereClause,
      limit: contest?.numQuestions || 10,
      include: [{ model: QuestionOption, as: 'options' }],
    });

    if (!questions || questions.length === 0) {
      questions = await Question.findAll({
        where: { isActive: true },
        limit: contest?.numQuestions || 10,
        include: [{ model: QuestionOption, as: 'options' }],
      });
    }

    return res.status(200).json({ success: true, data: questions || [] });
  } catch (error) {
    next(error);
  }
});

// Public Legal Policies & Support Contact
const legalController = require('../controllers/legal.controller');

router.get('/public/terms', legalController.getPublicPolicy('terms'));
router.get('/public/legal/terms', legalController.getPublicPolicy('terms'));

router.get('/public/privacy', legalController.getPublicPolicy('privacy'));
router.get('/public/legal/privacy', legalController.getPublicPolicy('privacy'));

router.get('/public/refund', legalController.getPublicPolicy('refund'));
router.get('/public/legal/refund', legalController.getPublicPolicy('refund'));

router.get('/public/support-contact', legalController.getSupportContact);

router.post('/public/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    try {
      const notificationService = require('../services/notification.service');
      await notificationService.createNotification({
        targetRole: 'admin',
        type: 'support',
        title: 'New Support Message',
        message: `${name} (${email}) sent: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
        data: { name, email, subject, message }
      });
    } catch (notifErr) {}

    return res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
