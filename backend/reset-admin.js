/**
 * Reset Admin Credentials Script
 * Updates the existing admin user's email and password in the database.
 * Run with: node reset-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

// ── New credentials ───────────────────────────────────────────────────────────
const NEW_EMAIL    = 'admin@gmail.com';
const NEW_PASSWORD = 'admin123';
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const { sequelize } = require('./src/config/db');
  const User = require('./src/database/models/user.model');

  try {
    await sequelize.authenticate();
    console.log('✔  DB connected.');

    // Find any existing admin (role = admin or super_admin)
    const admin = await User.findOne({
      where: {
        role: ['admin', 'super_admin'],
      },
    });

    if (!admin) {
      console.error('✘  No admin user found in the database.');
      console.log('   Run "node seed-admin.js" first to create one.');
      await sequelize.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    await admin.update({
      email:    NEW_EMAIL,
      password: hashedPassword,
    });

    console.log('✔  Admin credentials updated successfully!');
    console.log(`   Email   : ${NEW_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log(`   Role    : ${admin.role}`);
  } catch (err) {
    console.error('✘  Error updating admin credentials:', err.message);
  } finally {
    try { await sequelize.close(); } catch (_) {}
  }
}

main();
