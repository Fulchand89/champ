const authRepository = require('./auth.repository');

const { UserDTO } = require('../utils/auth.dto');
const { generateToken } = require('../shared/utils/jwt');
const { BadRequestError, UnauthorizedError } = require('../shared/exceptions');
const messages = require('../shared/constants/messages');

const registerUser = async (userData) => {
  // Check if email already exists via repository
  const existingUserByEmail = await authRepository.findByEmail(userData.email);
  if (existingUserByEmail) {
    throw new BadRequestError(messages.EMAIL_ALREADY_EXISTS);
  }
  // Check if mobile already exists via repository (if provided)
  if (userData.mobile) {
    const existingUserByMobile = await authRepository.findByMobile(userData.mobile);
    if (existingUserByMobile) {
      throw new BadRequestError(messages.MOBILE_ALREADY_EXISTS);
    }
  }

  // Validate required City
  if (!userData.city || String(userData.city).trim() === '') {
    throw new BadRequestError('City is required for registration');
  }

  // Validate required Aadhar details
  if (!userData.adharNumber) {
    throw new BadRequestError('Aadhar number is required for registration');
  }

  // Check if Aadhar already exists
  const existingUserByAdhar = await authRepository.findByAdharNumber(userData.adharNumber);
  if (existingUserByAdhar) {
    throw new BadRequestError(messages.ADHAR_ALREADY_EXISTS || 'User with this Aadhar number already exists');
  }

  // Validate required Aadhar images (front and back or uploaded files)
  if (!userData.adharImages || !Array.isArray(userData.adharImages) || userData.adharImages.length === 0) {
    throw new BadRequestError('Aadhar card image(s) (front and back) are required for registration');
  }

  // Ensure isVerified is 'pending' (false) by default
  userData.isVerified = 'pending';

  // Create new user via repository
  const user = await authRepository.create(userData);

  try {
    const notificationService = require('./notification.service');
    notificationService.createNotification({
      userId: user.id,
      targetRole: 'admin',
      type: 'user',
      title: 'New User Registered',
      message: `${user.name} (${user.email}) has registered on KnowChamp.`,
      data: { userId: user.id, name: user.name, email: user.email }
    }).catch(() => {});
  } catch (notifErr) {}

  // Return the client-safe DTO
  return UserDTO.fromUser(user);
};

const loginUser = async (email, password, reqIp = '127.0.0.1', deviceAgent = 'Web App') => {
  const roles = require('../shared/constants/roles');
  // Find user by email via repository
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError(messages.INVALID_CREDENTIALS);
  }

  // Validate password (method sits on Sequelize model instance)
  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    throw new UnauthorizedError(messages.INVALID_CREDENTIALS);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError(messages.ACCOUNT_INACTIVE);
  }

  // Generate JWT token
  const token = generateToken({ id: user.id, role: user.role });

  // Update last login
  await authRepository.update(user, { lastLogin: new Date() });

  return {
    user: UserDTO.fromUser(user),
    token
  };
};

const crypto = require('crypto');
const emailService = require('../shared/services/email.service');
const { emailLogger } = require('../config/logger');


const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const forgotPassword = async (email) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    // Return silently to prevent email enumeration, but for this app we might throw NotFound
    throw new BadRequestError('User not found with this email');
  }

  const otp = generateOtp();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10); // OTP valid for 10 mins

  await authRepository.update(user, {
    resetPasswordToken: otp,
    resetPasswordExpires: expires
  });

  // Fire-and-forget: Do not await email sending to prevent API response delays
  emailService.sendOtpEmail(user.email, user.name, otp).catch(err => {
    emailLogger.error(`Fire-and-forget email dispatch failed for ${user.email}:`, err);
  });
};

const resendOtp = async (email) => {
  // Re-use forgotPassword logic since it does exactly the same thing
  await forgotPassword(email);
};

const verifyOtp = async (email, otp) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new BadRequestError('User not found with this email');
  }

  // Check if OTP matches and hasn't expired
  if (user.resetPasswordToken !== otp || user.resetPasswordExpires < new Date()) {
    throw new BadRequestError(messages.OTP_INVALID);
  }

  // Generate a secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Extend expiration for reset token (e.g., another 15 minutes to reset password)
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 15);

  await authRepository.update(user, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: expires
  });

  return resetToken;
};

const resetPassword = async (email, resetToken, newPassword) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new BadRequestError('User not found with this email');
  }

  // Check if resetToken matches and hasn't expired
  if (user.resetPasswordToken !== resetToken || user.resetPasswordExpires < new Date()) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  // The password will be automatically hashed by the beforeUpdate hook in the model
  await authRepository.update(user, {
    password: newPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null
  });
};

const updateProfile = async (user, updates) => {
  // Updates have already been sanitized by the DTO layer
  if (updates.email && updates.email.toLowerCase() !== user.email?.toLowerCase()) {
    const existingUser = await authRepository.findByEmail(updates.email.toLowerCase());
    if (existingUser && existingUser.id !== user.id) {
      throw new BadRequestError(messages.EMAIL_ALREADY_EXISTS);
    }
    updates.email = updates.email.toLowerCase();
  }
  const updatedUser = await authRepository.update(user, updates);
  return UserDTO.fromUser(updatedUser);
};

const requestEmailChange = async (user, newEmail) => {
  // Check if new email is already in use by another user
  const existingUser = await authRepository.findByEmail(newEmail);
  if (existingUser) {
    throw new BadRequestError(messages.EMAIL_ALREADY_EXISTS);
  }

  // Generate 6-digit OTP
  const otp = generateOtp();

  // Set expiration (10 minutes)
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10);

  // Update user with pending email and OTP
  await authRepository.update(user, {
    pendingEmail: newEmail,
    emailChangeToken: otp,
    emailChangeExpires: expires,
  });

  // Send email (fire-and-forget)
  emailService.sendEmailChangeOtp(newEmail, user.name, otp).catch(err => {
    emailLogger.error(`Failed to send email change OTP to ${newEmail}:`, err);
  });
};

const resendEmailChangeOtp = async (user) => {
  if (!user.pendingEmail) {
    throw new BadRequestError(messages.NO_PENDING_EMAIL);
  }

  // Generate new OTP
  const otp = generateOtp();

  // Reset expiration
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10);

  await authRepository.update(user, {
    emailChangeToken: otp,
    emailChangeExpires: expires,
  });

  // Send email (fire-and-forget)
  emailService.sendEmailChangeOtp(user.pendingEmail, user.name, otp).catch(err => {
    emailLogger.error(`Failed to resend email change OTP to ${user.pendingEmail}:`, err);
  });
};

const verifyEmailChange = async (user, otp) => {
  if (!user.pendingEmail) {
    throw new BadRequestError(messages.NO_PENDING_EMAIL);
  }

  // Check if OTP matches and hasn't expired
  if (user.emailChangeToken !== otp || user.emailChangeExpires < new Date()) {
    throw new BadRequestError(messages.OTP_INVALID);
  }

  // Ensure new email wasn't taken while OTP was pending
  const existingUser = await authRepository.findByEmail(user.pendingEmail);
  if (existingUser && existingUser.id !== user.id) {
    throw new BadRequestError(messages.EMAIL_ALREADY_EXISTS);
  }

  // Update main email and clear temporary fields
  await authRepository.update(user, {
    email: user.pendingEmail,
    pendingEmail: null,
    emailChangeToken: null,
    emailChangeExpires: null,
  });
};

const deleteProfile = async (user) => {
  await authRepository.delete(user);
};




const googleAuthUser = async (idToken, mobile, role = 'user', additionalData = {}, reqIp = '127.0.0.1', deviceAgent = 'Mobile / Web App') => {
  const { getAuth } = require('../config/firebase');


  const {
    city,
    adharNumber,
    adharImages,
    isTermAccpeted = true,
  } = (typeof additionalData === 'object' && additionalData !== null) ? additionalData : {};

  // Sanitize token (strip 'Bearer ' and quotes if passed by mistake)
  const cleanIdToken = typeof idToken === 'string' ? idToken.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '').trim() : idToken;

  let firebaseUid, email, name, picture;

  // Check if token is a full JWT (3 parts separated by dots) or a 28-char Firebase UID
  const isJwt = typeof cleanIdToken === 'string' && cleanIdToken.split('.').length === 3;

  if (isJwt) {
    try {
      const decodedToken = await getAuth().verifyIdToken(cleanIdToken);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email;
      name = decodedToken.name || decodedToken.displayName;
      picture = decodedToken.picture || decodedToken.photoURL;
    } catch (error) {
      console.error('Firebase JWT Token Verification Failed:', error.message);
      throw new UnauthorizedError('Invalid or expired Firebase ID token');
    }
  } else {
    // Attempt Firebase UID lookup via Firebase Admin SDK
    try {
      const userRecord = await getAuth().getUser(cleanIdToken);
      firebaseUid = userRecord.uid;
      email = userRecord.email;
      name = userRecord.displayName;
      picture = userRecord.photoURL;
    } catch (uidError) {
      console.error('Firebase UID lookup failed:', uidError.message);
      throw new UnauthorizedError('Invalid Firebase ID token or Firebase UID');
    }
  }

  if (!email) {
    throw new BadRequestError('Google account must have an associated email address');
  }

  // Check if user exists by firebaseUid or email
  let user = await authRepository.findByFirebaseUid(firebaseUid);

  if (!user) {
    user = await authRepository.findByEmail(email);
  }

  // If user does not exist -> check for mandatory first-time registration fields (mobile, city, Aadhar)
  if (!user) {
    const hasAadhaarImages = adharImages && Array.isArray(adharImages) && adharImages.length > 0;
    const isMissingRequiredFields = !mobile || !city || !adharNumber || !hasAadhaarImages;

    if (isMissingRequiredFields) {
      return {
        requiresAdditionalInfo: true,
        requiresMobile: true,
        message: 'Mobile number, city, Aadhaar number, and Aadhaar card images are mandatory for registration.',
        missingFields: {
          mobile: !mobile,
          city: !city,
          adharNumber: !adharNumber,
          adharImages: !hasAadhaarImages,
        },
        firebaseData: {
          email,
          name: name || 'Google User',
          profilePicUrl: picture || null,
          firebaseUid,
        }
      };
    }

    // Check if mobile already exists in system
    const existingMobileUser = await authRepository.findByMobile(mobile);
    if (existingMobileUser) {
      throw new BadRequestError(messages.MOBILE_ALREADY_EXISTS);
    }

    // Check if Aadhar already exists
    const existingUserByAdhar = await authRepository.findByAdharNumber(adharNumber);
    if (existingUserByAdhar) {
      throw new BadRequestError(messages.ADHAR_ALREADY_EXISTS || 'User with this Aadhar number already exists');
    }

    const assignedRole = role === 'super_admin' ? 'super_admin' : (role === 'admin' ? 'admin' : 'user');

    // Create new Google User with isVerified: 'pending' (false by default)
    user = await authRepository.create({
      name: name || 'Google User',
      email,
      mobile,
      city,
      adharNumber,
      adharImages,
      firebaseUid,
      authProvider: 'google',
      role: assignedRole,
      profilePicUrl: picture || null,
      isVerified: 'pending', // Default is pending (false)
      isTermAccpeted: isTermAccpeted !== undefined ? Boolean(isTermAccpeted) : true,
      isActive: true,
    });


  } else {
    // User exists. Update missing fields if applicable
    const updates = {};
    if (!user.firebaseUid) updates.firebaseUid = firebaseUid;
    if (!user.profilePicUrl && picture) updates.profilePicUrl = picture;

    // Check if existing user is missing profile info
    if (!user.mobile && mobile) {
      const existingMobileUser = await authRepository.findByMobile(mobile);
      if (existingMobileUser && existingMobileUser.id !== user.id) {
        throw new BadRequestError(messages.MOBILE_ALREADY_EXISTS);
      }
      updates.mobile = mobile;
    }
    if (!user.city && city) updates.city = city;
    if (!user.adharNumber && adharNumber) updates.adharNumber = adharNumber;
    if ((!user.adharImages || user.adharImages.length === 0) && adharImages) updates.adharImages = adharImages;

    if (Object.keys(updates).length > 0) {
      user = await authRepository.update(user, updates);
    }
  }

  // Check if account is active
  if (!user.isActive) {
    throw new UnauthorizedError(messages.ACCOUNT_INACTIVE);
  }

  // Generate App JWT Token
  const token = generateToken({ id: user.id, role: user.role });
  await authRepository.update(user, { lastLogin: new Date() });



  return {
    requiresMobile: false,
    user: UserDTO.fromUser(user),
    token
  };
};

const changePassword = async (user, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Both current password and new password are required');
  }

  // Validate current password
  const isValid = await user.validatePassword(currentPassword);
  if (!isValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Update password (model beforeUpdate hook automatically hashes user.password)
  user.password = newPassword;
  await user.save();

  return true;
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resendOtp,
  verifyOtp,
  resetPassword,
  updateProfile,
  changePassword,
  requestEmailChange,
  resendEmailChangeOtp,
  verifyEmailChange,
  deleteProfile,
  googleAuthUser,
};
