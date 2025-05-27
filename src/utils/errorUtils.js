// errors/CustomErrors.js
class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, "CONFLICT", details);
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, "DATABASE_ERROR");
    this.originalError = originalError;
  }
}

class BusinessLogicError extends AppError {
  constructor(message, details = null) {
    super(message, 422, "BUSINESS_LOGIC_ERROR", details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  BusinessLogicError,
};
