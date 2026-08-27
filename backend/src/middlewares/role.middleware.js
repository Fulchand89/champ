const { ForbiddenError } = require('../shared/exceptions');

const roleMiddleware = (...allowedRoles) => {
  const rolesList = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user || !rolesList.includes(req.user.role)) {
      return next(new ForbiddenError());
    }
    next();
  };
};

module.exports = roleMiddleware;
