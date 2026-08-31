const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const roles = require('../../shared/constants/roles');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uuid: {
    type: DataTypes.STRING(12),
  },
  firebaseUid: {
    type: DataTypes.STRING(128),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM(Object.values(roles)),
    defaultValue: roles.USER,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  isTermAccpeted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  authProvider: {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local',
    comment: 'Authentication provider: local (email/password) or google',
  },
  profilePicUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'City of residence/operation of the user',
  },
  adharNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '12-digit Aadhaar/Adhar identification number',
  },
  adharImages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Aadhaar card image URLs (stores 2 image URLs: front and back side)',
  },
  aadharNumber: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('adharNumber');
    },
    set(value) {
      this.setDataValue('adharNumber', value);
    },
  },
  aadharImages: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('adharImages');
    },
    set(value) {
      this.setDataValue('adharImages', value);
    },
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  pendingEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  emailChangeToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  emailChangeExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: 'users_uuid_unique',
      unique: true,
      fields: ['uuid']
    },
    {
      name: 'users_email_unique',
      unique: true,
      fields: ['email']
    },
    {
      name: 'users_firebase_uid_unique',
      unique: true,
      fields: ['firebaseUid']
    },
    {
      name: 'users_mobile_unique',
      unique: true,
      fields: ['mobile']
    },
    {
      name: 'users_city_index',
      fields: ['city']
    },
    {
      name: 'users_adhar_number_index',
      fields: ['adharNumber']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (!user.uuid) {
        const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
        let prefix = 'USR';
        if (user.role === roles.SUPER_ADMIN) {
          prefix = 'SUP';
        } else if (user.role === roles.ADMIN) {
          prefix = 'ADM';
        }
        user.uuid = `${prefix}-${randomPart}`;
      }

      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// Instance method to check password
User.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Class method to find by email with password
User.findByEmail = function (email) {
  if (!email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  return this.findOne({
    where: sequelize.where(
      sequelize.fn('LOWER', sequelize.col('email')),
      cleanEmail
    )
  });
};

module.exports = User;