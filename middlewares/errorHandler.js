const { error } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  const path = req?.originalUrl || req?.url || 'unknown';
  process.stderr.write(`[API_ERROR] ${req?.method || 'UNKNOWN'} ${path} - ${err?.stack || err?.message || err}\n`);

  if (err && err.code === '23505') {
    return error(res, 'Resource already exists', 409);
  }

  if (err && err.code === '23503') {
    return error(res, 'Referenced record not found', 400);
  }

  if (err && err.code === '23514') {
    return error(res, 'Constraint violation', 400);
  }

  return error(res, err.message || 'Internal server error', 500);
};

module.exports = errorHandler;
