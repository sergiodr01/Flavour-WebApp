function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: `Requires role: ${role}` });
    }
    next();
  };
}

module.exports = requireRole;
