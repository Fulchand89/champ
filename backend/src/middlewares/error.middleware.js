const logger = require('../config/logger');
const { ApiError } = require('../shared/exceptions');
const MESSAGES = require('../shared/constants/messages');

const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Log error explicitly to console for Vercel runtime logs and logger
  console.error('GLOBAL SERVER ERROR:', err);
  logger.error(`${err.status || err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError' ? 400 : 500);
    const message = error.message || MESSAGES.INTERNAL_ERROR;
    error = new ApiError(statusCode, message, false, err.stack);
    // Preserve original error properties for specific handling below
    error.name = err.name;
    error.errors = err.errors;
  }
  
  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
  
  // Handle specific error types
  if (error.name === 'ValidationError' || error.message === MESSAGES.VALIDATION_ERROR) {
    response.message = MESSAGES.VALIDATION_ERROR;
    response.errors = error.errors;
  } else if (error.name === 'SequelizeValidationError') {
    response.message = MESSAGES.VALIDATION_ERROR;
    response.errors = error.errors?.map(e => ({
      field: e.path,
      message: e.message,
    })) || [];
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    response.message = MESSAGES.DUPLICATE_ENTRY;
    response.errors = error.errors?.map(e => ({
      field: e.path,
      message: `${e.path} ${MESSAGES.ALREADY_EXISTS}`,
    })) || [];
  }
  
  // Log validation errors if present
  if (response.errors) {
    logger.error(`Validation Errors: ${JSON.stringify(response.errors)}`);
  }
  
  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;