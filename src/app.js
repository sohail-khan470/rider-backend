const express = require("express");
const app = express();
const { adminRoutes } = require("./auth");

// Middleware for parsing JSON
app.use(express.json());

/** Auth routes */
app.use("/auth/admin", adminRoutes);

/** 404 Handler - Route Not Found */
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

/** Global Error Handler */
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
});

module.exports = app;
