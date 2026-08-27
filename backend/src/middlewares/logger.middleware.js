const morgan = require('morgan');
const logger = require('../config/logger');
const env = require('../config/env');

// Stream morgan output to winston
const stream = {
  write: (message) => logger.info(message.trim()),
};
const format = env.nodeEnv === 'development' ? 'dev' : 'combined';
const loggerMiddleware = morgan(format, { stream });

module.exports = loggerMiddleware;