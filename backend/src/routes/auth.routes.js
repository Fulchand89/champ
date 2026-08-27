const express = require('express');
const authController = require('../controllers/auth.controller');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
  updateProfileValidator,
  requestEmailChangeValidator,
  verifyEmailChangeValidator,
  googleAuthValidator
} = require('../middlewares/auth.validator');
const validate = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const optimizeImage = require('../middlewares/optimizeImage.middleware');

const router = express.Router();

// Public Routes
router.post(
  '/register',
  upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'adhar_images', maxCount: 2 },
    { name: 'adharImages', maxCount: 2 },
  ]),
  optimizeImage,
  validate(registerValidator),
  authController.register
);

// login
router.post('/login', validate(loginValidator), authController.login);
router.post('/login/admin', validate(loginValidator), authController.loginAdmin);
router.post('/login/super-admin', validate(loginValidator), authController.loginSuperAdmin);

router.post(
  '/google',
  upload.fields([
    { name: 'profile_pic', maxCount: 1 },
    { name: 'adhar_images', maxCount: 2 },
    { name: 'adharImages', maxCount: 2 },
  ]),
  optimizeImage,
  validate(googleAuthValidator),
  authController.googleAuth
);

// OTP & Password Reset Flow
router.post('/forgot-password', validate(forgotPasswordValidator), authController.forgotPassword);
router.post('/resend-otp', validate(forgotPasswordValidator), authController.resendOtp);
router.post('/verify-otp', validate(verifyOtpValidator), authController.verifyOtp);
router.post('/reset-password', validate(resetPasswordValidator), authController.resetPassword);

// Protected Routes
router.delete('/me/profile-pic', authMiddleware, authController.deleteProfilePic);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/me', authMiddleware, upload.single('profile_pic'), optimizeImage, validate(updateProfileValidator), authController.updateProfile);
router.put('/me/change-password', authMiddleware, authController.changePassword);

// Email Change Flow
router.post('/me/change-email/request', authMiddleware, validate(requestEmailChangeValidator), authController.requestEmailChange);
router.post('/me/change-email/resend', authMiddleware, authController.resendEmailChangeOtp);
router.post('/me/change-email/verify', authMiddleware, validate(verifyEmailChangeValidator), authController.verifyEmailChange);

module.exports = router;
