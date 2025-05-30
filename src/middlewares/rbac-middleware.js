// middleware/rbac.js
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        company: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      companyId: user.companyId,
      company: user.company,
      permissions: user.role.permissions.map((rp) => rp.permission.name),
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string|string[]} allowedRoles - Single role or array of roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.roleName)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions
 * @param {string} operator - 'AND' or 'OR' (default: 'AND')
 */
const requirePermission = (requiredPermissions, operator = "AND") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const userPermissions = req.user.permissions;

    let hasAccess = false;

    if (operator === "OR") {
      // User needs at least one of the required permissions
      hasAccess = permissions.some((permission) =>
        userPermissions.includes(permission)
      );
    } else {
      // User needs all required permissions (AND)
      hasAccess = permissions.every((permission) =>
        userPermissions.includes(permission)
      );
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission(s): ${permissions.join(
          ` ${operator} `
        )}`,
      });
    }

    next();
  };
};

/**
 * Company-based authorization middleware
 * Ensures user can only access resources from their own company
 */
const requireSameCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  // Extract companyId from request (params, body, or query)
  const targetCompanyId = parseInt(
    req.params.companyId || req.body.companyId || req.query.companyId
  );

  if (!targetCompanyId) {
    return res.status(400).json({
      success: false,
      message: "Company ID is required.",
    });
  }

  if (req.user.companyId !== targetCompanyId) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied. You can only access resources from your own company.",
    });
  }

  next();
};

/**
 * Super Admin middleware - only allows super admins
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a super admin token
    if (decoded.type !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin privileges required.",
      });
    }

    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: decoded.superAdminId },
    });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Super admin not found.",
      });
    }

    req.superAdmin = {
      id: superAdmin.id,
      email: superAdmin.email,
    };

    next();
  } catch (error) {
    console.error("Super admin authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
const requireOwnership = (resourceModel, userIdField = "userId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const resourceId = parseInt(req.params.id);

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID is required.",
        });
      }

      const resource = await prisma[resourceModel].findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
        });
      }

      if (resource[userIdField] !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources.",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };
};

/**
 * Conditional middleware - applies middleware based on condition
 */
const conditionalMiddleware = (condition, middleware) => {
  return (req, res, next) => {
    if (condition(req)) {
      return middleware(req, res, next);
    }
    next();
  };
};

/**
 * Multiple middleware combiner
 */
const combineMiddleware = (...middlewares) => {
  return (req, res, next) => {
    let index = 0;

    const runNext = (error) => {
      if (error) return next(error);

      if (index >= middlewares.length) return next();

      const middleware = middlewares[index++];
      middleware(req, res, runNext);
    };

    runNext();
  };
};

module.exports = {
  authenticate,
  requireRole,
  requirePermission,
  requireSameCompany,
  requireSuperAdmin,
  requireOwnership,
  conditionalMiddleware,
  combineMiddleware,
};
