const { error } = require('../utils/apiResponse');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Unauthorized', 401);
  if (!roles.includes(req.user.role)) return error(res, 'Forbidden: insufficient permissions', 403);
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.type !== 'student') return error(res, 'Student access required', 403);
  next();
};

module.exports = { requireRole, requireStudent };
