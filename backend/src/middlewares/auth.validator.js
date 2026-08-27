const { body } = require('express-validator');
const roles = require('../shared/constants/roles');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile is required')
    .isLength({ min: 10, max: 15 }).withMessage('Mobile must be between 10 and 15 characters')
    .isNumeric().withMessage('Mobile must contain only numbers'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('adharNumber')
    .optional({ checkFalsy: true })
    .custom((val, { req }) => {
      const adhar = val || req.body.aadharNumber;
      if (!adhar || String(adhar).trim() === '') {
        throw new Error('Aadhar number is required');
      }
      const cleaned = String(adhar).replace(/[\s-]/g, '');
      if (!/^\d{12}$/.test(cleaned)) {
        throw new Error('Aadhar number must be a valid 12-digit number');
      }
      return true;
    }),
  body('aadharNumber')
    .optional({ checkFalsy: true }),
  body('isTermAccpeted')
    .optional()
    .isBoolean().withMessage('isTermAccpeted must be a boolean (true or false)')
    .toBoolean(),
  body('role')
    .optional()
    .isIn(Object.values(roles)).withMessage('Invalid role provided'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
];

const verifyOtpValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const resetPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('resetToken')
    .trim()
    .notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Mobile must be between 10 and 15 characters')
    .isNumeric().withMessage('Mobile must contain only numbers'),
];

const requestEmailChangeValidator = [
  body('newEmail')
    .trim()
    .notEmpty().withMessage('New email is required')
    .isEmail().withMessage('Invalid email address'),
];

const verifyEmailChangeValidator = [
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const googleAuthValidator = [
  body('idToken')
    .trim()
    .notEmpty().withMessage('Firebase ID token is required'),
  body('role')
    .optional()
    .isIn(Object.values(roles)).withMessage('Invalid role provided'),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Mobile must be between 10 and 15 characters')
    .isNumeric().withMessage('Mobile must contain only numbers'),
  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters'),
  body('adharNumber')
    .optional({ checkFalsy: true })
    .custom((val, { req }) => {
      const adhar = val || req.body.aadharNumber;
      if (adhar) {
        const cleaned = String(adhar).replace(/[\s-]/g, '');
        if (!/^\d{12}$/.test(cleaned)) {
          throw new Error('Aadhar number must be a valid 12-digit number');
        }
      }
      return true;
    }),
  body('aadharNumber')
    .optional({ checkFalsy: true }),
  body('adharImages')
    .optional({ nullable: true }),
  body('aadharImages')
    .optional({ nullable: true }),
  body('isTermAccpeted')
    .optional()
    .isBoolean().withMessage('isTermAccpeted must be a boolean (true or false)')
    .toBoolean(),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
  updateProfileValidator,
  requestEmailChangeValidator,
  verifyEmailChangeValidator,
  googleAuthValidator,
};
