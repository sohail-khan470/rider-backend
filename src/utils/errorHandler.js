// src/utils/errorHandler.js

const handleValidationError = (error, res) => {
  console.error("Validation Error:", error);
  const errors = error.details.map((i) => ({
    message: i.message,
    field: i.path.join("."),
  }));
  return res
    .status(400)
    .json({ success: false, message: "Validation error", errors: errors });
};

const handleNotFoundError = (message, res) => {
  console.error("Not Found Error:", message);
  return res
    .status(404)
    .json({ success: false, message: message || "Resource not found" });
};

const handleBadRequestError = (message, res) => {
  console.error("Bad Request Error:", message);
  return res
    .status(400)
    .json({ success: false, message: message || "Bad request" });
};

const handleUnauthorizedError = (message, res) => {
  console.error("Unauthorized Error:", message);
  return res
    .status(401)
    .json({ success: false, message: message || "Unauthorized" });
};

const handleForbiddenError = (message, res) => {
  console.error("Forbidden Error:", message);
  return res
    .status(403)
    .json({ success: false, message: message || "Forbidden" });
};

const handleServerError = (error, res) => {
  console.error("Server Error:", error);
  return res
    .status(500)
    .json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
};

module.exports = {
  handleValidationError,
  handleNotFoundError,
  handleBadRequestError,
  handleUnauthorizedError,
  handleForbiddenError,
  handleServerError,
};
