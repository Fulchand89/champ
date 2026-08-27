'use strict';
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const roles = require('../../shared/constants/roles');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clear the users table first to prevent duplicate entry errors
    await queryInterface.bulkDelete('users', null, {});

    // Generate a secure hashed password using bcrypt
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      {
        uuid: `SUP-${randomBytes(4).toString('hex').toUpperCase()}`,
        name: 'Super Admin',
        email: 'superadmin@quizapp.com',
        mobile: '9999999999',
        password: hashedPassword,
        city: 'New Delhi',
        role: roles.SUPER_ADMIN,
        isActive: true,
        isVerified: 'approved',
        isTermAccpeted: true,
        authProvider: 'local',
        profilePicUrl: null,
        lastLogin: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: `ADM-${randomBytes(4).toString('hex').toUpperCase()}`,
        name: 'Admin User',
        email: 'admin@quizapp.com',
        mobile: '9876543210',
        password: hashedPassword,
        city: 'Mumbai',
        role: roles.ADMIN,
        isActive: true,
        isVerified: 'approved',
        isTermAccpeted: true,
        authProvider: 'local',
        profilePicUrl: null,
        lastLogin: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: `USR-${randomBytes(4).toString('hex').toUpperCase()}`,
        name: 'John User',
        email: 'user@quizapp.com',
        mobile: '9123456780',
        password: hashedPassword,
        city: 'Bangalore',
        role: roles.USER,
        isActive: true,
        isVerified: 'approved',
        isTermAccpeted: true,
        authProvider: 'local',
        profilePicUrl: null,
        lastLogin: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeExpires: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
