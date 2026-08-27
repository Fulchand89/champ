/**
 * Seed script: creates an admin user for the admin portal.
 * Run with: node seed-admin.js
 * You can change the email/password below before running.
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ── Customize these credentials ──────────────────────────────────────────────
const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@knowchamp.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_ROLE     = 'admin';          // or 'super_admin'
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const { sequelize } = require('./src/config/db');
  const User = require('./src/database/models/user.model');

  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    // Check if the email already exists
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log(`User with email "${ADMIN_EMAIL}" already exists (role: ${existing.role}).`);
      console.log('If you forgot the password, update it with: node seed-admin.js --reset');
      await sequelize.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    const prefix = ADMIN_ROLE === 'super_admin' ? 'SUP' : 'ADM';

    await User.create({
      uuid:          `${prefix}-${randomPart}`,
      name:          ADMIN_NAME,
      email:         ADMIN_EMAIL,
      password:      hashedPassword,
      role:          ADMIN_ROLE,
      isActive:      true,
      isVerified:    'approved',
      isTermAccpeted: true,
      authProvider:  'local',
    });

    console.log('✔  Admin user created successfully!');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role    : ${ADMIN_ROLE}`);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
  } finally {
    try { await sequelize.close(); } catch (_) {}
  }
}

main();
