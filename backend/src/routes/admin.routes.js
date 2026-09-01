const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');
const optimizeImage = require('../middlewares/optimizeImage.middleware');

const router = express.Router();

// Branding / Settings Endpoints (GET /settings is public/optional auth for platform title, PUT /settings is strictly protected)
router.get('/settings', (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && (req.cookies.token || req.cookies.adminToken)) {
    token = req.cookies.token || req.cookies.adminToken;
  }
  if (token) {
    try {
      const { verifyToken } = require('../shared/utils/jwt');
      const User = require('../database/models/user.model');
      const decoded = verifyToken(token);
      User.findByPk(decoded.id).then((u) => {
        if (u && u.isActive) req.user = u;
        next();
      }).catch(() => next());
      return;
    } catch (e) {}
  }
  next();
}, adminController.getSettings);

// Apply Auth and Role limits on all protected Admin management endpoints
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'super_admin'));

router.put('/settings', upload.single('logo'), optimizeImage, adminController.updateSettings);

// Notification Logs Endpoints
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.sendNotification);
router.get('/notifications/unread-count', adminController.getUnreadCount);
router.patch('/notifications/read', adminController.markNotificationsRead);
router.delete('/notifications', adminController.deleteNotifications);

// Analytics Reports Endpoints
router.get('/analytics/reports', adminController.getAnalyticsReports);
router.get('/analytics/reports/user-participation', adminController.getUserParticipationReport);
router.get('/analytics/reports/contests', adminController.getContestReport);
router.get('/analytics/reports/contest-payments', adminController.getContestPaymentReport);
router.get('/analytics/reports/financial', adminController.getFinancialReport);
router.get('/analytics/reports/contest-results', adminController.getContestResultReport);

// Category CRUD Endpoints
router.get('/categories', adminController.getCategories);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', upload.single('image'), optimizeImage, adminController.createCategory);
router.put('/categories/:id', upload.single('image'), optimizeImage, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Subject & Topic Endpoints
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

router.get('/topics', adminController.getTopics);
router.post('/topics', adminController.createTopic);
router.put('/topics/:id', adminController.updateTopic);
router.delete('/topics/:id', adminController.deleteTopic);

// Fee Tiers Endpoints
router.get('/entry-fee-tiers', adminController.getFeeTiers);
router.post('/entry-fee-tiers', adminController.createFeeTier);
router.put('/entry-fee-tiers/:id', adminController.updateFeeTier);
router.delete('/entry-fee-tiers/:id', adminController.deleteFeeTier);

// Question Bank Endpoints
router.get('/questions/template/csv', adminController.downloadCsvTemplate);
router.post('/questions/upload', upload.single('file'), adminController.uploadQuestions);
router.get('/questions', adminController.getQuestions);
router.get('/questions/:id', adminController.getQuestionById);
router.post('/questions', adminController.createQuestion);
router.put('/questions/:id', adminController.updateQuestion);
router.delete('/questions/:id', adminController.deleteQuestion);

// Prize Pool Templates Endpoints
router.get('/prize-templates', adminController.getPrizeTemplates);
router.post('/prize-templates', adminController.createPrizeTemplate);
router.put('/prize-templates/:id', adminController.updatePrizeTemplate);
router.delete('/prize-templates/:id', adminController.deletePrizeTemplate);

// Live & Scheduled Contest Specialized Endpoints (Before :id routes)
router.get('/contests/scheduled', adminController.getScheduledContests);
router.get('/contests/live', adminController.getLiveContests);

// Contest Specific Nested Endpoints
router.get('/contests/:id/schedule', adminController.getContestSchedule);
router.post('/contests/:id/schedule', adminController.updateContestSchedule);
router.put('/contests/:id/schedule', adminController.updateContestSchedule);
router.delete('/contests/:id/schedule', adminController.cancelContestSchedule);

router.get('/contests/:id/entry-fee', adminController.getContestEntryFee);
router.post('/contests/:id/entry-fee', adminController.updateContestEntryFee);
router.put('/contests/:id/entry-fee', adminController.updateContestEntryFee);

router.get('/contests/:id/prize-pool', adminController.getContestPrizePool);
router.post('/contests/:id/prize-pool', adminController.updateContestPrizePool);
router.put('/contests/:id/prize-pool', adminController.updateContestPrizePool);
router.delete('/contests/:id/prize-pool', adminController.deleteContestPrizePool);

router.get('/contests/:id/live', adminController.getLiveContestDetails);
router.get('/contests/:id/participants', adminController.getContestParticipants);
router.get('/contests/:id/results', adminController.getContestResults);
router.get('/contests/:id/statistics', adminController.getContestStatistics);

// Contest Main CRUD Endpoints
router.get('/contests', adminController.getContests);
router.get('/contests/:id', adminController.getContestById);
router.post('/contests', upload.single('image'), optimizeImage, adminController.createContest);
router.put('/contests/:id', upload.single('image'), optimizeImage, adminController.updateContest);
router.delete('/contests/:id', adminController.deleteContest);

// Feature CRUD Endpoints
router.get('/features', adminController.getFeatures);
router.post('/features', adminController.createFeature);
router.put('/features/:id', adminController.updateFeature);
router.delete('/features/:id', adminController.deleteFeature);

// User Management Endpoints
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Transaction Management Endpoints
router.get('/transactions/export', adminController.exportCsv);
router.get('/transactions', adminController.getTransactions);
router.get('/transactions/:id', adminController.getTransactionById);
router.post('/transactions', adminController.createTransaction);

// Withdrawal Management Endpoints
router.get('/withdrawals', adminController.getWithdrawals);
router.get('/withdrawals/:id', adminController.getWithdrawalById);
router.put('/withdrawals/:id/verify', adminController.verifyWithdrawal);

// FAQ CRUD Endpoints
router.get('/faq', adminController.getFaq);
router.post('/faq', adminController.createFaq);
router.put('/faq/:id', adminController.updateFaq);
router.delete('/faq/:id', adminController.deleteFaq);

// Legal Policies & Support Contact Endpoints
const legalController = require('../controllers/legal.controller');

// Terms & Conditions
router.get('/legal/terms', legalController.getTerms);
router.post('/legal/terms', legalController.publishTerms);
router.put('/legal/terms/:id/toggle', legalController.toggleTermsStatus);
router.patch('/legal/terms/:id/toggle', legalController.toggleTermsStatus);
router.put('/legal/terms/:id/restore', legalController.restoreTermsVersion);
router.patch('/legal/terms/:id/restore', legalController.restoreTermsVersion);

// Privacy Policy
router.get('/legal/privacy', legalController.getPrivacy);
router.post('/legal/privacy', legalController.publishPrivacy);
router.put('/legal/privacy/:id/toggle', legalController.togglePrivacyStatus);
router.patch('/legal/privacy/:id/toggle', legalController.togglePrivacyStatus);
router.put('/legal/privacy/:id/restore', legalController.restorePrivacyVersion);
router.patch('/legal/privacy/:id/restore', legalController.restorePrivacyVersion);

// Refund Policy
router.get('/legal/refund', legalController.getRefund);
router.post('/legal/refund', legalController.publishRefund);
router.put('/legal/refund/:id/toggle', legalController.toggleRefundStatus);
router.patch('/legal/refund/:id/toggle', legalController.toggleRefundStatus);
router.put('/legal/refund/:id/restore', legalController.restoreRefundVersion);
router.patch('/legal/refund/:id/restore', legalController.restoreRefundVersion);

// Support Contact
router.get('/support-contact', legalController.getSupportContact);
router.put('/support-contact', legalController.updateSupportContact);

module.exports = router;
