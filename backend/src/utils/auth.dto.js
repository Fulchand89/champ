const { formatUrl, formatImageList } = require('../shared/utils/urlFormatter');

class UserDTO {
  constructor(user) {
    this.id = user.id;
    this.uuid = user.uuid;
    this.name = user.name;
    this.email = user.email;
    this.mobile = user.mobile;
    this.role = user.role;
    this.city = user.city;
    this.dob = user.dob || '1995-01-01';
    this.panNumber = user.panNumber || 'ABCDE1234F';
    this.address = user.address || 'New Delhi, India';
    this.adharNumber = user.adharNumber || '123456789012';
    this.aadhaarNumber = user.adharNumber || '123456789012';
    this.adharImages = formatImageList(user.adharImages);
    this.isActive = user.isActive;
    this.isVerified = user.isVerified;
    this.isTermAccpeted = user.isTermAccpeted;
    this.authProvider = user.authProvider;
    this.profilePicUrl = formatUrl(user.profilePicUrl);
    this.lastLogin = user.lastLogin;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromUser(user) {
    if (!user) return null;
    return new UserDTO(user);
  }

  static fromUsers(users) {
    return users.map(user => UserDTO.fromUser(user));
  }
}

class RegisterDTO {
  constructor(reqBody) {
    this.name = reqBody.name;
    this.email = reqBody.email;
    this.mobile = reqBody.mobile;
    this.password = reqBody.password;
    this.role = reqBody.role;
    this.city = reqBody.city;
    this.adharNumber = reqBody.adharNumber || reqBody.aadharNumber;
    this.adharImages = reqBody.adharImages || reqBody.aadharImages || reqBody.adharimages;
    if (reqBody.isTermAccpeted !== undefined) {
      this.isTermAccpeted = reqBody.isTermAccpeted === true || reqBody.isTermAccpeted === 'true' || reqBody.isTermAccpeted === 1 || reqBody.isTermAccpeted === '1';
    }
  }
  static fromRequest(reqBody) {
    return new RegisterDTO(reqBody);
  }
}

class LoginDTO {
  constructor(reqBody) {
    this.email = reqBody.email ? String(reqBody.email).trim().toLowerCase() : '';
    this.password = reqBody.password ? String(reqBody.password).trim() : '';
  }
  static fromRequest(reqBody) {
    return new LoginDTO(reqBody);
  }
}

class UpdateProfileDTO {
  constructor(reqBody) {
    const allowedFields = ['name', 'email', 'mobile', 'city', 'profilePicUrl'];
    allowedFields.forEach(field => {
      if (reqBody[field] !== undefined) {
        this[field] = reqBody[field];
      }
    });
    if (this.email && typeof this.email === 'string') {
      this.email = this.email.trim().toLowerCase();
    }
  }
  static fromRequest(reqBody) {
    return new UpdateProfileDTO(reqBody);
  }
}

class ResetPasswordDTO {
  constructor(reqBody) {
    this.email = reqBody.email;
    this.resetToken = reqBody.resetToken;
    this.newPassword = reqBody.newPassword;
  }
  static fromRequest(reqBody) {
    return new ResetPasswordDTO(reqBody);
  }
}

class VerifyOtpDTO {
  constructor(reqBody) {
    this.email = reqBody.email;
    this.otp = reqBody.otp;
  }
  static fromRequest(reqBody) {
    return new VerifyOtpDTO(reqBody);
  }
}

class EmailDTO {
  constructor(reqBody) {
    this.email = reqBody.email || reqBody.newEmail;
  }
  static fromRequest(reqBody) {
    return new EmailDTO(reqBody);
  }
}

class OtpDTO {
  constructor(reqBody) {
    this.otp = reqBody.otp;
  }
  static fromRequest(reqBody) {
    return new OtpDTO(reqBody);
  }
}

module.exports = {
  UserDTO,
  RegisterDTO,
  LoginDTO,
  UpdateProfileDTO,
  ResetPasswordDTO,
  VerifyOtpDTO,
  EmailDTO,
  OtpDTO
};
