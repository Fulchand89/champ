const ApiError = require('./ApiError');
const MESSAGES = require('../constants/messages');

class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    const message = resource === 'Resource'
      ? MESSAGES.NOT_FOUND
      : resource.toLowerCase().includes('not found')
        ? resource
        : `${resource} not found`;
    super(404, message);
  }
}

module.exports = NotFoundError;