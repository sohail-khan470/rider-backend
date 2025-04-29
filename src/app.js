const express = require("express");
const app = express();
const cors = require("cors");

//** Routes **/

// const rolesRoutes = require("./src/roles/roles-routes");
const { superAdminRoutes, companyAdminRoutes } = require("./auth");
const { companyRoutes } = require("./company");
const { bookingRoutes } = require("./bookings");
const { customerRoutes } = require("./customer");
const { driverRoutes } = require("./drivers");
const { locationRoutes } = require("./location");
const { staffRoutes } = require("./staff");

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

/** Routes */
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/company-admin", companyAdminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/staff", staffRoutes);

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
