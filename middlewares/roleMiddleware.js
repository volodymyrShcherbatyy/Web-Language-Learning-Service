const { error } = require('../utils/response');

const roleMiddleware = (requiredRole) => (req, res, next) => {
  if (!req.user || req.user.role !== requiredRole) {
    return error(res, 'Forbidden', 403);
  }
  return next();
};

module.exports = roleMiddleware;
