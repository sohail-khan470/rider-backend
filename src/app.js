const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const jwt = require("jsonwebtoken");
const notificationRoutes = require("./notification/notification-routes");

//** Routes **/

// const rolesRoutes = require("./src/roles/roles-routes");

const { companyRoutes } = require("./company");
const { bookingRoutes } = require("./bookings");
const { customerRoutes } = require("./customer");
const { driverRoutes } = require("./drivers");
const { locationRoutes } = require("./location");
const { userRoutes } = require("./user");
const { rolesRoutes } = require("./roles");
const { cityRoutes } = require("./city");
const { authMiddleware } = require("./middlewares/authMiddleware");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const morgan = require("morgan");
const errorHandler = require("./middlewares/error-handler");
const { notifcationRoutes } = require("./notification");
const socketManager = require("./socket/socketManager");
const { contactRouter } = require("./company-contact");
const { addressRouter } = require("./company-address");
const { login, signup, getProfile } = require("./auth/auth-controller");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // or use '*' for all origins (not recommended for production)
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    // credentials: true, // only if you're using cookies or sessions
  })
);

const io = socketManager.initialize(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    //credentials: true,
  },
});

/** Health Check */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/**generic auth */
app.use("/auth/login", login);
app.use("/auth/signup", signup);
app.use("/auth/me", getProfile);

/** Routes */

app.use(authMiddleware);

app.use("/api/cities", cityRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/notifications", notifcationRoutes);
app.use("/api/company-contact", contactRouter);
app.use("/api/company-address", addressRouter);

/** 404 Handler - Route Not Found */

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/** Error Handler */
app.use(errorHandler);

module.exports = server;
