// middleware/authorize.js
function authorize({ roles = [], permissions = [] }) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Role check (if roles provided)
    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    // Permission check (if permissions provided)
    if (permissions.length > 0) {
      const hasPermissions = permissions.some((p) =>
        user.permissions.includes(p)
      );
      if (!hasPermissions) {
        return res
          .status(403)
          .json({ message: "Forbidden: Missing permissions" });
      }
    }

    next();
  };
}

module.exports = authorize;
