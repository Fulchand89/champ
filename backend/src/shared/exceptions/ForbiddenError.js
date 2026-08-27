const ApiError = require('./ApiError');
const MESSAGES = require('../constants/messages');

class ForbiddenError extends ApiError {
  constructor(message = MESSAGES.FORBIDDEN) {
    super(403, message);
  }
}

module.exports = ForbiddenError;
