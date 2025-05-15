// src/middlewares/errorHandler.js
const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/errorUtils");

const errorHandler = (err, req, res, next) => {
  // Default values for unexpected errors
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";

  // Handle different types of errors
  let error = { ...err };
  error.message = err.message;

  // Log the error for development
  console.error("ERROR 💥", err);

  // Handle specific error types
  if (error.name === "ValidationError") {
    // Mongoose validation error
    const messages = Object.values(err.errors).map((el) => el.message);
    error = new AppError(
      `Invalid input data: ${messages.join(". ")}`,
      StatusCodes.BAD_REQUEST
    );
  } else if (error.name === "CastError") {
    // Mongoose bad ID format
    error = new AppError(
      `Invalid ${err.path}: ${err.value}`,
      StatusCodes.BAD_REQUEST
    );
  } else if (error.code === 11000) {
    // Mongoose duplicate key
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(
      `Duplicate field value: ${field}. Please use another value.`,
      StatusCodes.BAD_REQUEST
    );
  } else if (error.name === "JsonWebTokenError") {
    error = new AppError(
      "Invalid token. Please log in again!",
      StatusCodes.UNAUTHORIZED
    );
  } else if (error.name === "TokenExpiredError") {
    error = new AppError(
      "Your token has expired! Please log in again.",
      StatusCodes.UNAUTHORIZED
    );
  }

  // Send response to client
  if (req.originalUrl.startsWith("/api")) {
    // API error response
    return res.status(error.statusCode).json({
      success: false,
      status: error.status,
      message: error.message || "Something went wrong!",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
      ...(error.errors && { errors: error.errors }), // Include validation errors if present
    });
  }

  // For non-API routes (if you have any)
  return res.status(error.statusCode).render("error", {
    title: "Something went wrong!",
    msg: error.message,
  });
};

module.exports = errorHandler;
