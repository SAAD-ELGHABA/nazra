const ROLE_CAPABILITIES = Object.freeze({
  admin: new Set([
    "dashboard.view",
    "orders.read",
    "orders.manage",
    "orders.export",
    "products.read",
    "products.manage",
    "inventory.read",
    "inventory.manage",
    "blog.manage",
    "blog.publish",
    "analytics.read",
    "customers.read",
    "customers.manage",
    "subscribers.read",
    "subscribers.manage",
    "subscribers.export",
    "contacts.read",
    "contacts.manage",
    "reviews.read",
    "reviews.manage",
    "activity.read",
    "settings.read"
  ]),
  superadmin: new Set([
    "dashboard.view",
    "orders.read",
    "orders.manage",
    "orders.export",
    "products.read",
    "products.manage",
    "inventory.read",
    "inventory.manage",
    "blog.manage",
    "blog.publish",
    "analytics.read",
    "customers.read",
    "customers.manage",
    "subscribers.read",
    "subscribers.manage",
    "subscribers.export",
    "contacts.read",
    "contacts.manage",
    "reviews.read",
    "reviews.manage",
    "activity.read",
    "settings.read",
    "settings.manage",
    "admins.manage"
  ])
});

const canonicalRole = (role) => role === "super-admin" ? "superadmin" : role;

const getCapabilitiesForRole = (role) => Array.from(ROLE_CAPABILITIES[canonicalRole(role)] || []);

const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication required."
    });
  }

  const capabilities = ROLE_CAPABILITIES[canonicalRole(req.user.role)];
  const permitted = permissions.every((permission) => capabilities?.has(permission));

  if (!permitted) {
    return res.status(403).json({
      success: false,
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action."
    });
  }

  return next();
};

module.exports = requirePermission;
module.exports.getCapabilitiesForRole = getCapabilitiesForRole;
module.exports._test = { ROLE_CAPABILITIES, canonicalRole, getCapabilitiesForRole };
