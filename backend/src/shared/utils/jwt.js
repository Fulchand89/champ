const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const { ApiError } = require('../exceptions');

const generateToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};