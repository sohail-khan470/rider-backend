const express = require("express");
const app = express();
const apiRoutes = require("./src/routes");
const { logger } = require("./src/config");

const { serverConfig } = require("./src/config");
const PORT = serverConfig.PORT;

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  logger.info(`successfully running on port ${PORT}`, "root", {});
});
