// middleware/errorHandler.js
const { StatusCodes } = require("http-status-codes");

function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err);

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
