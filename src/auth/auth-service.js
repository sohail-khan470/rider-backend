const { logger } = require("../config");

const login = async (data) => {
  logger.info("*****auth service is running");
  return "auth-serivce";
};

module.exports = { login };
