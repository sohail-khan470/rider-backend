const { logger } = require("../config");
const authService = require("./auth-service");
const { StatusCodes } = require("http-status-codes");

const login = async (req, res) => {
  try {
    const response = await authService.login(req.body);
    return res.status(StatusCodes.OK).json({
      success: true,
      error: {},
      data: response,
      message: "Login successful",
    });
  } catch (error) {
    logger.error("Error during login: ${error.message}");
  }
};

module.exports = { login };
