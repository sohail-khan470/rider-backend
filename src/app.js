const express = require("express");
const { serverConfig } = require("./config");
const app = express();
const PORT = serverConfig.PORT;
const authRoutes = require("../src/auth/auth-routes");

/**auth routes */

app.use("/api/auth", authRoutes);

module.exports = app;
