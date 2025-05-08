const express = require("express");
const app = express();
const cors = require("cors");

//** Routes **/

// const rolesRoutes = require("./src/roles/roles-routes");
const { superAdminRoutes, authContoller } = require("./auth");
const { companyRoutes } = require("./company");
const { bookingRoutes } = require("./bookings");
const { customerRoutes } = require("./customer");
const { driverRoutes } = require("./drivers");
const { locationRoutes } = require("./location");
const auth = require("./auth");
const { userRoutes } = require("./user");

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

/**generic auth */
app.use("/auth/login", authContoller.loginController);
app.use("/auth/me", authContoller.getProfile);

/** Routes */
app.use("/super-admin", superAdminRoutes);

app.use("/api/company", companyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/users", userRoutes);

/** 404 Handler - Route Not Found */
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

/** Global Error Handler */
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
  console.log(err);
});

module.exports = app;
