const { StatusCodes } = require("http-status-codes");

function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...req.params,
        ...req.query,
      });
      req.validatedData = validatedData;
      next();
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Validation error: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
        errors: error.errors,
      });
    }
  };
}

module.exports = { validateRequest };
