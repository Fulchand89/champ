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
  const hasPassword = Boolean(process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASS || process.env.db_password);
  const host = process.env.DB_HOST || 'srv1823.hstgr.io';
  const user = process.env.DB_USER || 'u879279162_camelcaravan';
  const database = process.env.DB_NAME || 'u879279162_camelcaravan';

  try {
    const { sequelize } = require('../database');
    await sequelize.authenticate();
    res.status(200).json({
      status: 'OK',
      database: 'connected',
      details: { host, user, database, passwordConfigured: hasPassword }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      error: error.message,
      details: {
        host,
        user,
        database,
        passwordConfigured: hasPassword,
        hint: !hasPassword ? 'DB_PASSWORD is missing in Vercel Environment Variables' : 'Check MySQL user password and Hostinger Remote MySQL % wildcard'
      }
    });
  }
});

// Role-based Modular Routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Public Content Endpoints
const { Category, Contest, Feature, FAQ } = require('../database');

const defaultCategories = [
  { id: 1, name: 'General Knowledge', slug: 'general-knowledge', icon: '📚', colorClass: 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]', isActive: true },
  { id: 2, name: 'Science & Technology', slug: 'science-technology', icon: '🔬', colorClass: 'hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]', isActive: true },
  { id: 3, name: 'Mathematics & Logic', slug: 'mathematics-logic', icon: '🧮', colorClass: 'hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.25)]', isActive: true },
  { id: 4, name: 'History & Culture', slug: 'history-culture', icon: '📜', colorClass: 'hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,119,6,0.25)]', isActive: true },
  { id: 5, name: 'Sports & Entertainment', slug: 'sports-entertainment', icon: '⚽', colorClass: 'hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.25)]', isActive: true },
  { id: 6, name: 'Current Affairs', slug: 'current-affairs', icon: '📰', colorClass: 'hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]', isActive: true }
];

const defaultFaqs = [
  { id: 1, question: "How do I join a quiz contest?", answer: "Simply create an account, verify your mobile number, add funds to your wallet (if required), and click 'Start Contest' for any live quiz to begin.", displayOrder: 1, isActive: true },
  { id: 2, question: "Is KnowChamp free to use?", answer: "We offer both free practice contests and paid cash contests. You can choose to join free contests to hone your skills before playing paid ones.", displayOrder: 2, isActive: true },
  { id: 3, question: "How are winners selected?", answer: "Winners are selected based on the number of correct answers and the speed of response. The leaderboard displays the ranks in real-time.", displayOrder: 3, isActive: true },
  { id: 4, question: "How can I add money to my wallet?", answer: "You can easily add money using secure UPI, Credit/Debit cards, Net Banking, or popular digital wallets inside the app's wallet section.", displayOrder: 4, isActive: true },
  { id: 5, question: "When will I receive my winnings?", answer: "Winnings are credited to your KnowChamp wallet immediately after the contest results are verified, which usually takes a few minutes. You can withdraw instantly.", displayOrder: 5, isActive: true },
  { id: 6, question: "Can I participate in multiple contests?", answer: "Yes, you can participate in as many active contests as you want, provided you meet the entry fee requirements.", displayOrder: 6, isActive: true }
];

const defaultFeatures = [
  { id: 1, title: 'Live Real-time Quizzes', description: 'Compete against thousands of live players simultaneously in adrenaline-pumping live contests.', icon: 'Zap', displayOrder: 1, isActive: true },
  { id: 2, title: 'Instant UPI Withdrawals', description: 'Withdraw your cash prize winnings instantly to your bank account or UPI ID with 24/7 processing.', icon: 'Wallet', displayOrder: 2, isActive: true },
  { id: 3, title: 'Fair Play & Verified Leaderboards', description: 'Anti-cheat protection and automated transparent rank calculations guaranteed on every contest.', icon: 'ShieldCheck', displayOrder: 3, isActive: true },
  { id: 4, title: 'Rich Question Bank', description: 'Thousands of high-yield questions covering competitive exams, GK, science, maths, and current affairs.', icon: 'BookOpen', displayOrder: 4, isActive: true }
];

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
      data: Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs
    });
  } catch (error) {
    console.error('PUBLIC FAQ ERROR:', error.message);
    return res.status(200).json({
      success: true,
      data: defaultFaqs
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
      data: Array.isArray(features) && features.length > 0 ? features : defaultFeatures
    });
  } catch (error) {
    console.error('PUBLIC FEATURES ERROR:', error.message);
    return res.status(200).json({
      success: true,
      data: defaultFeatures
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
      data: Array.isArray(categories) && categories.length > 0 ? categories : defaultCategories
    });
  } catch (error) {
    console.error('PUBLIC CATEGORIES ERROR:', error.message);
    return res.status(200).json({
      success: true,
      data: defaultCategories
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
    console.error('PUBLIC CONTESTS ERROR:', error.message);
    return res.status(200).json({
      success: true,
      data: []
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

// Public CMS Endpoints
const cmsController = require('../controllers/cms.controller');
router.get('/public/cms/leaderboard', cmsController.getLeaderboardCms);
router.get('/public/cms/excellence-league', cmsController.getExcellenceLeagueCms);
router.get('/public/cms/how-it-works', cmsController.getHowItWorksCms);


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
