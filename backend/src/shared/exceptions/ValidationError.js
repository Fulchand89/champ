const ApiError = require('./ApiError');
const MESSAGES = require('../constants/messages');

class ValidationError extends ApiError {
  constructor(errors) {
    super(400, MESSAGES.VALIDATION_ERROR);
    this.errors = errors;
  }
}

module.exports = ValidationError;