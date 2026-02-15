const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return error(res, 'Unauthorized', 401);
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = {
      user_id: payload.user_id,
      role: payload.role
    };
    return next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401);
  }
};

module.exports = authMiddleware;
