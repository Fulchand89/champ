const authService = require('../services/auth.service');
const { UserDTO, RegisterDTO, LoginDTO, UpdateProfileDTO, ResetPasswordDTO, VerifyOtpDTO, EmailDTO, OtpDTO } = require('../utils/auth.dto');
const asyncHandler = require('../shared/utils/asyncHandler');
const messages = require('../shared/constants/messages');
const { ForbiddenError } = require('../shared/exceptions');
const fs = require('fs');
const path = require('path');

// Register
const register = asyncHandler(async (req, res) => {
  const registerDto = RegisterDTO.fromRequest(req.body);
  if (req.file) {
    registerDto.profilePicUrl = `/uploads/profile_pics/${req.file.filename}`;
  } else if (req.files) {
    if (req.files.profile_pic && req.files.profile_pic.length > 0) {
      registerDto.profilePicUrl = `/uploads/profile_pics/${req.files.profile_pic[0].filename}`;
    }
    const adharFiles = req.files.adhar_images || req.files.adharImages || req.files.aadhar_images || req.files.aadharImages;
    if (adharFiles && adharFiles.length > 0) {
      registerDto.adharImages = adharFiles.map(f => `/uploads/adhar_images/${f.filename}`);
    }
  }
  if (typeof registerDto.adharImages === 'string') {
    try { registerDto.adharImages = JSON.parse(registerDto.adharImages); } catch (e) { registerDto.adharImages = [registerDto.adharImages]; }
  }
  try {
    const user = await authService.registerUser(registerDto);
    res.status(201).json({ success: true, message: messages.REGISTER_SUCCESS, data: user });
  } catch (error) {
    const filesToCleanup = [];
    if (req.file) filesToCleanup.push(req.file);
    if (req.files) {
      for (const fieldName of Object.keys(req.files)) {
        req.files[fieldName].forEach(f => filesToCleanup.push(f));
      }
    }
    filesToCleanup.forEach(f => {
      if (f.path && fs.existsSync(f.path)) {
        fs.unlink(f.path, err => { if (err && err.code !== 'ENOENT') console.error(`Failed to delete uploaded file after registration error: ${f.path}`, err); });
      }
    });
    throw error;
  }
});

// Login (user)
const login = asyncHandler(async (req, res) => {
  const { email, password } = LoginDTO.fromRequest(req.body);
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';
  const deviceAgent = req.headers['user-agent'] || 'QuizApp Mobile / Web';
  const result = await authService.loginUser(email, password, clientIp, deviceAgent);
  if (result.user.role !== 'user') throw new ForbiddenError('Access denied. Only standard users can login to this portal.');
  res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(200).json({ success: true, message: messages.LOGIN_SUCCESS, data: result });
});

// Admin login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = LoginDTO.fromRequest(req.body);
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';
  const deviceAgent = req.headers['user-agent'] || 'Admin Web Dashboard';
  const result = await authService.loginUser(email, password, clientIp, deviceAgent);
  if (result.user.role !== 'admin' && result.user.role !== 'super_admin') throw new ForbiddenError('Access denied. Only administrators can login to this portal.');
  res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(200).json({ success: true, message: messages.LOGIN_SUCCESS, data: result });
});

// Super admin login
const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = LoginDTO.fromRequest(req.body);
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';
  const deviceAgent = req.headers['user-agent'] || 'Super Admin Web Portal';
  const result = await authService.loginUser(email, password, clientIp, deviceAgent);
  if (result.user.role !== 'super_admin') throw new ForbiddenError('Access denied. Only super administrators can login to this portal.');
  res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(200).json({ success: true, message: messages.LOGIN_SUCCESS, data: result });
});

// Google auth
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken, mobile, role, isTermAccpeted, city } = req.body;
  const adharNumber = req.body.adharNumber || req.body.aadharNumber;
  let adharImages = req.body.adharImages || req.body.aadharImages || req.body.adhar_images;
  if (req.files) {
    const adharFiles = req.files.adhar_images || req.files.adharImages || req.files.aadhar_images || req.files.aadharImages;
    if (adharFiles && adharFiles.length > 0) adharImages = adharFiles.map(f => `/uploads/adhar_images/${f.filename}`);
  }
  if (typeof adharImages === 'string') {
    try { adharImages = JSON.parse(adharImages); } catch (e) { adharImages = [adharImages]; }
  }
  const additionalData = { city, adharNumber, adharImages, isTermAccpeted };
  const clientIp = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '127.0.0.1';
  const deviceAgent = req.headers['user-agent'] || 'QuizApp Mobile / Web';
  const result = await authService.googleAuthUser(idToken, mobile, role, additionalData, clientIp, deviceAgent);
  if (result.requiresAdditionalInfo || result.requiresMobile) {
    return res.status(200).json({ success: true, requiresAdditionalInfo: true, requiresMobile: true, message: result.message, data: result.firebaseData });
  }
  res.cookie('token', result.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(200).json({ success: true, requiresMobile: false, message: messages.LOGIN_SUCCESS, data: result });
});

// Profile
const getProfile = asyncHandler(async (req, res) => {
  const userData = UserDTO.fromUser(req.user);
  res.status(200).json({ success: true, message: messages.SUCCESS, data: userData });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = EmailDTO.fromRequest(req.body);
  await authService.forgotPassword(email);
  res.status(200).json({ success: true, message: messages.OTP_SENT });
});

// Resend OTP
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = EmailDTO.fromRequest(req.body);
  await authService.resendOtp(email);
  res.status(200).json({ success: true, message: messages.OTP_SENT });
});

// Verify OTP
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = VerifyOtpDTO.fromRequest(req.body);
  const resetToken = await authService.verifyOtp(email, otp);
  res.status(200).json({ success: true, message: messages.OTP_VERIFIED, data: { resetToken } });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword } = ResetPasswordDTO.fromRequest(req.body);
  await authService.resetPassword(email, resetToken, newPassword);
  res.status(200).json({ success: true, message: messages.PASSWORD_RESET_SUCCESS });
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const updates = UpdateProfileDTO.fromRequest(req.body);
  if (req.file) {
    updates.profilePicUrl = `/uploads/profile_pics/${req.file.filename}`;
    if (req.user.profilePicUrl && req.user.profilePicUrl.startsWith('/uploads/')) {
      const oldPicPath = path.join(__dirname, '../../', req.user.profilePicUrl);
      fs.unlink(oldPicPath, err => { if (err && err.code !== 'ENOENT') console.error(`Failed to delete old profile picture: ${oldPicPath}`, err); });
    }
  }
  const updatedUser = await authService.updateProfile(req.user, updates);
  res.status(200).json({ success: true, message: messages.PROFILE_UPDATE_SUCCESS, data: updatedUser });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user, currentPassword, newPassword);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// Delete profile picture
const deleteProfilePic = asyncHandler(async (req, res) => {
  if (!req.user.profilePicUrl) { const { BadRequestError } = require('../shared/exceptions'); throw new BadRequestError(messages.PROFILE_PIC_NOT_FOUND); }
  if (req.user.profilePicUrl.startsWith('/uploads/')) {
    const oldPicPath = path.join(__dirname, '../../', req.user.profilePicUrl);
    fs.unlink(oldPicPath, err => { if (err && err.code !== 'ENOENT') console.error(`Failed to delete profile picture during removal: ${oldPicPath}`, err); });
  }
  await authService.updateProfile(req.user, { profilePicUrl: null });
  res.status(200).json({ success: true, message: messages.PROFILE_PIC_DELETE_SUCCESS });
});

// Email change flow
const requestEmailChange = asyncHandler(async (req, res) => {
  const { email: newEmail } = EmailDTO.fromRequest(req.body);
  await authService.requestEmailChange(req.user, newEmail);
  res.status(200).json({ success: true, message: messages.EMAIL_CHANGE_OTP_SENT });
});

const resendEmailChangeOtp = asyncHandler(async (req, res) => {
  await authService.resendEmailChangeOtp(req.user);
  res.status(200).json({ success: true, message: messages.EMAIL_CHANGE_OTP_SENT });
});

const verifyEmailChange = asyncHandler(async (req, res) => {
  const { otp } = OtpDTO.fromRequest(req.body);
  await authService.verifyEmailChange(req.user, otp);
  res.status(200).json({ success: true, message: messages.EMAIL_CHANGE_SUCCESS });
});

// Delete profile
const deleteProfile = asyncHandler(async (req, res) => {
  await authService.deleteProfile(req.user);
  res.status(200).json({ success: true, message: messages.PROFILE_DELETE_SUCCESS || 'Profile deleted successfully' });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, loginAdmin, loginSuperAdmin, googleAuth, getProfile, forgotPassword, resendOtp, verifyOtp, resetPassword, updateProfile, changePassword, deleteProfilePic, requestEmailChange, resendEmailChangeOtp, verifyEmailChange, deleteProfile, logout };
