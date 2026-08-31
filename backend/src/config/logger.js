const winston = require('winston');
const path = require('path');
const fs = require('fs');
const env = require('./env');

// Detect Vercel Serverless Environment
const isVercel = !!process.env.VERCEL;

// Common log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console log format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

// Main logger transports
const loggerTransports = [];

// Email logger transports
const emailLoggerTransports = [];

/*
|--------------------------------------------------------------------------
| File Logging
|--------------------------------------------------------------------------
| Disable Winston File transports on Vercel.
| Vercel Serverless Functions cannot use /var/task/logs for persistent logs.
*/

const os = require('os');

const logDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'logs')
  : (path.isAbsolute(env.logDir || '') ? env.logDir : path.join(process.cwd(), env.logDir || 'logs'));

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error.message);
}

if (!isVercel) {
  try {

    // Main application logs
    loggerTransports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5
      }),

      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    );

    // Email logs
    emailLoggerTransports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'email.log'),
        maxsize: 5242880,
        maxFiles: 5
      })
    );

  } catch (err) {
    console.error('Failed to initialize file logging:', err);
  }
}

/*
|--------------------------------------------------------------------------
| Console Logging
|--------------------------------------------------------------------------
| Console logs work on both localhost and Vercel.
*/

if (process.env.SILENT_LOGS !== 'true') {
  loggerTransports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );

  emailLoggerTransports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

/*
|--------------------------------------------------------------------------
| Main Logger
|--------------------------------------------------------------------------
*/

const logger = winston.createLogger({
  level:
    env.nodeEnv === 'development'
      ? env.logLevel || 'debug'
      : 'info',

  format: logFormat,

  defaultMeta: {
    service: 'quiz-app-api'
  },

  transports: loggerTransports
});

/*
|--------------------------------------------------------------------------
| Dedicated Email Logger
|--------------------------------------------------------------------------
*/

const emailLogger = winston.createLogger({
  level: 'info',

  format: logFormat,

  defaultMeta: {
    service: 'camel-logistics-email'
  },

  transports: emailLoggerTransports
});

// Attach emailLogger to main loggerlo
logger.emailLogger = emailLogger;

module.exports = logger;