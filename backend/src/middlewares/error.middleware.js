const logger = require('../config/logger');
const { ApiError } = require('../shared/exceptions');
const MESSAGES = require('../shared/constants/messages');

const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Log error explicitly to console for Vercel runtime logs and server debugging
  console.error('SERVER API ERROR:', err.name || 'Error', err.message);
  if (err.stack) console.error(err.stack);
  logger.error(`${err.status || err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  let statusCode = error.statusCode || error.status || 500;
  let customMessage = error.message || MESSAGES.INTERNAL_ERROR;
  let errorList = error.errors || [];

  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorList = error.errors?.map(e => ({
      field: e.path,
      message: `${e.path || 'Item'} already exists`,
    })) || [];
    customMessage = errorList.length > 0 ? errorList[0].message : MESSAGES.DUPLICATE_ENTRY;
  } else if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorList = error.errors?.map(e => ({
      field: e.path,
      message: e.message,
    })) || [];
    customMessage = errorList.length > 0 ? errorList[0].message : MESSAGES.VALIDATION_ERROR;
  } else if (error.name === 'ValidationError' || error.message === MESSAGES.VALIDATION_ERROR) {
    statusCode = 400;
    const firstErr = Array.isArray(error.errors) && error.errors.length > 0
      ? (error.errors[0].message || error.errors[0].msg || error.errors[0])
      : null;
    customMessage = firstErr || MESSAGES.VALIDATION_ERROR;
  } else if (error.name === 'SequelizeDatabaseError') {
    console.error('DATABASE ERROR DETAILS:', error.parent || error.original);
    customMessage = error.original?.sqlMessage || error.message;
  }
  
  const response = {
    success: false,
    message: customMessage,
    error: customMessage,
    ...(errorList.length > 0 && { errors: errorList }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
  
  res.status(statusCode).json(response);
};

module.exports = errorHandler;