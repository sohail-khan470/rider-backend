// src/utils/errorUtils.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    // Remove operational flag and stack trace for cleaner frontend handling
  }
}

module.exports = { AppError };
