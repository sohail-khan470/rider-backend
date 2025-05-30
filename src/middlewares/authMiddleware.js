// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/errorUtils");

/**
 * Middleware to authenticate company admins using JWT
 */
const authMiddleware = async (req, res, next) => {
  console.log("im runnning");
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Unauthorized: No token provided",
        StatusCodes.UNAUTHORIZED
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(
        "Unauthorized: No token provided",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = {
      userId: decoded.id,
      companyId: decoded.companyId,
      role: "company_admin",
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(
        new AppError("Unauthorized: Invalid token", StatusCodes.UNAUTHORIZED)
      );
    }

    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Unauthorized: Token expired", StatusCodes.UNAUTHORIZED)
      );
    }

    next(error);
  }
};

module.exports = {
  authMiddleware,
};
