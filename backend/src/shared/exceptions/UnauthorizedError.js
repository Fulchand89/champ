const ApiError = require('./ApiError');
const MESSAGES = require('../constants/messages');

class UnauthorizedError extends ApiError {
  constructor(message = MESSAGES.UNAUTHORIZED) {
    super(401, message);
  }
}

module.exports = UnauthorizedError;