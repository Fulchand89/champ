const { verifyToken } = require('../shared/utils/jwt');
const { UnauthorizedError } = require('../shared/exceptions');
const messages = require('../shared/constants/messages');
const User = require('../database/models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError(messages.TOKEN_REQUIRED);
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new UnauthorizedError(messages.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new UnauthorizedError(messages.ACCOUNT_INACTIVE || messages.UNAUTHORIZED);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
