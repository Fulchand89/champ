const ApiError = require('./ApiError');
const MESSAGES = require('../constants/messages');

class BadRequestError extends ApiError {
  constructor(message = MESSAGES.BAD_REQUEST) {
    super(400, message);
  }
}

module.exports = BadRequestError;
