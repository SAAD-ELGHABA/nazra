const canonicalRole = (role) => role === "super-admin" ? "superadmin" : role;

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  if (!allowedRoles.includes(canonicalRole(req.user.role))) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  return next();
};

module.exports = requireRole;
module.exports._test = { canonicalRole };
