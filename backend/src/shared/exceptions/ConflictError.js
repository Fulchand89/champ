const ApiError = require('./ApiError');

class ConflictError extends ApiError {
  constructor(
    message = 'Resource already exists',
    errors = null
  ) {
    super(409, message);

    this.name = 'ConflictError';

    if (errors) {
      this.errors = errors;
    }

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

module.exports = ConflictError;