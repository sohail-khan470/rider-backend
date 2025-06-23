const { allowedRoles } = require("./roles-constants");

// middleware/roleAuth.js

function requiredRoles(roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden - Invalid role" });
    }

    // 3. Verify role exists in system (security hardening)
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden - Unrecognized role" });
    }

    next();
  };
}

module.exports = { requiredRoles };
