const app = require("./src/app");
const { serverConfig, logger } = require("./src/config");
const PORT = serverConfig.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`successfully running on port ${PORT}`, "root");
});
