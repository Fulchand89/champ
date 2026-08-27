const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  // Server
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || 'development',

  // App
  app: {
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
  },

  // Database
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'quiz_app',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },

  // Rate Limiting
  rateLimit: {
    window: process.env.RATE_LIMIT_WINDOW || 1,
    max: process.env.RATE_LIMIT_MAX || 1000,
  },

  // File Upload
  upload: {
    maxSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg').split(','),
  },

  //Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
  logDir: process.env.LOG_DIR || 'logs',
  
  //Cors
  corsOrigin: process.env.CORS_ORIGIN || 'https://localhost:5173,https://192.168.1.9:5173,http://localhost:5173,http://192.168.1.9:5173',
   
  //Mail Configuration
  mail:{
    mailer: process.env.MAIL_MAILER || 'smtp',
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    username: process.env.MAIL_USERNAME || 'your-email@gmail.com',
    password: process.env.MAIL_PASSWORD || 'your-password',
    encryption: process.env.MAIL_ENCRYPTION || 'tls',
    fromAddress: process.env.MAIL_FROM_ADDRESS || 'your-email@gmail.com',
    fromName: process.env.MAIL_FROM_NAME || 'Your App',
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
  },
};