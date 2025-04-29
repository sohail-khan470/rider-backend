const express = require("express");
const app = express();
const cors = require("cors");
const { superAdminRoutes, comapanyAdminRoutes } = require("./auth");
const { bookingRoutes } = require("./bookings");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/** Health Check */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/** SuperAdmin Auth routes */
app.use("/company/admin", adminRoutes);
app.use("/auth/superadmin", superAdminRoutes);

//booking routes
app.use("/booking", bookingRoutes);

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
