const {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} = require("@prisma/client/runtime/library");
const { AppError } = require("../utils/errorUtils");

// Helper function to determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Handle Prisma errors
const handlePrismaError = (error) => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        // Unique constraint violation
        const target = error.meta?.target;
        return new AppError(
          `A record with this ${
            target ? target.join(", ") : "value"
          } already exists`,
          409,
          "DUPLICATE_ENTRY",
          { field: target }
        );

      case "P2025":
        // Record not found
        return new AppError("Record not found", 404, "NOT_FOUND");

      case "P2003":
        // Foreign key constraint violation
        return new AppError(
          "Operation failed due to related record constraints",
          400,
          "FOREIGN_KEY_CONSTRAINT"
        );

      case "P2014":
        // Required relation missing
        return new AppError(
          "Required related record is missing",
          400,
          "MISSING_RELATION"
        );

      default:
        return new AppError("Database operation failed", 500, "DATABASE_ERROR");
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new AppError("Invalid data provided", 400, "VALIDATION_ERROR");
  }

  return new AppError("Database error occurred", 500, "DATABASE_ERROR");
};

// Handle validation errors (e.g., from express-validator)
const handleValidationError = (error) => {
  if (error.array && typeof error.array === "function") {
    const errors = error.array();
    const details = errors.map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return new AppError("Validation failed", 400, "VALIDATION_ERROR", details);
  }

  return new AppError("Validation error", 400, "VALIDATION_ERROR");
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Prisma errors
  if (
    err.name === "PrismaClientKnownRequestError" ||
    err.name === "PrismaClientValidationError"
  ) {
    error = handlePrismaError(err);
  }

  // Handle validation errors
  if (err.name === "ValidationError" && err.array) {
    error = handleValidationError(err);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401, "INVALID_TOKEN");
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired", 401, "TOKEN_EXPIRED");
  }

  // Handle MongoDB cast errors (if you switch from MySQL later)
  if (err.name === "CastError") {
    error = new AppError("Invalid ID format", 400, "INVALID_ID");
  }

  // If it's not an operational error, create a generic one
  if (!error.isOperational) {
    error = new AppError(
      isProduction ? "Something went wrong" : err.message,
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }

  // Log error for debugging (you can integrate with logging service)
  console.error("Error occurred:", {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    timestamp: error.timestamp,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      message: error.message,
      code: error.errorCode,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
    },
  };

  // Add details if available
  if (error.details) {
    errorResponse.error.details = error.details;
  }

  // Add stack trace in development
  if (!isProduction && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  res.status(error.statusCode).json(errorResponse);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    "ROUTE_NOT_FOUND"
  );
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
