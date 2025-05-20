// src/middlewares/errorHandler.js
const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/errorUtils");

/**
 * Enhanced Error Handler Middleware
 * Processes different types of errors and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  // Create a copy to avoid mutating the original error
  const error = { ...err };
  error.message = err.message;
  error.statusCode =
    err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  error.status = err.status || "error";

  // Structured logging for better debugging
  const logDetails = {
    errorId: generateErrorId(),
    path: req.originalUrl,
    method: req.method,
    statusCode: error.statusCode,
    errorName: err.name,
    message: error.message,
    timestamp: new Date().toISOString(),
  };

  // Log differently based on environment and severity
  if (error.statusCode >= 500) {
    console.error("CRITICAL ERROR:", logDetails, err.stack);
  } else {
    console.warn("REQUEST ERROR:", logDetails);
  }

  // Process errors by type
  processErrorByType(err, error);

  // Send appropriate response based on request type
  return sendErrorResponse(req, res, error);
};

/**
 * Processes error based on its type and normalizes the response
 * @param {Error} originalError - The original error object
 * @param {Object} processedError - The error object being processed
 */
const processErrorByType = (originalErr, processedError) => {
  switch (originalErr.name) {
    case "ValidationError":
      // Handle mongoose validation errors
      const messages = Object.values(originalErr.errors).map(
        (el) => el.message
      );
      processedError.statusCode = StatusCodes.BAD_REQUEST;
      processedError.message = `Validation failed: ${messages.join(". ")}`;
      processedError.errors = originalErr.errors;
      break;

    case "CastError":
      // Handle invalid MongoDB ObjectId errors
      processedError.statusCode = StatusCodes.BAD_REQUEST;
      processedError.message = `Invalid ${originalErr.path}: ${originalErr.value}`;
      break;

    case "JsonWebTokenError":
      processedError.statusCode = StatusCodes.UNAUTHORIZED;
      processedError.message = "Invalid authentication token";
      break;

    case "TokenExpiredError":
      processedError.statusCode = StatusCodes.UNAUTHORIZED;
      processedError.message = "Authentication token expired";
      break;
  }

  // Handle MongoDB duplicate key error
  if (originalErr.code === 11000) {
    const field = Object.keys(originalErr.keyValue)[0];
    processedError.statusCode = StatusCodes.CONFLICT;
    processedError.message = `Duplicate value for ${field}`;
  }

  return processedError;
};

/**
 * Sends appropriate error response based on request type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} error - Processed error object
 */
const sendErrorResponse = (req, res, error) => {
  const isApiRequest = req.originalUrl.startsWith("/api");
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isApiRequest) {
    // API response structure
    const response = {
      success: false,
      status: error.status,
      message: error.message || "An unexpected error occurred",
      code: error.statusCode,
    };

    // Only include details in development mode
    if (isDevelopment) {
      response.stack = error.stack;

      // Include validation details if present
      if (error.errors) {
        response.errors = error.errors;
      }
    }

    return res.status(error.statusCode).json(response);
  } else {
    // Handle web view errors
    return res.status(error.statusCode).render("error", {
      title: "Something went wrong",
      msg: isDevelopment
        ? error.message
        : "An error occurred. Please try again later.",
    });
  }
};

/**
 * Generates a unique ID for error tracking
 * @returns {string} A unique error identifier
 */
const generateErrorId = () => {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substr(2, 5).toUpperCase()
  );
};

module.exports = errorHandler;
