// src/routes/driverRoutes.js
const express = require("express");
const router = express.Router();
const driverController = require("./drivers-controller");

// Create a driver
router.post("/register", driverController.createDriver);

// List all drivers
router.get("/getAll", driverController.listAllDrivers);

// Get a driver by ID
router.get("/:id", driverController.getDriverById);

// List drivers with optional status filter
router.get("/getAllDrivers", driverController.listDrivers);

// Update driver by ID
router.put("/:id", driverController.updateDriver);

// Update driver status
router.patch("/:id/updateStatus", driverController.updateDriverStatus);

// Delete a driver by ID
router.delete("/:id", driverController.deleteDriver);

// Add driver availability
router.post("/availability", driverController.addDriverAvailability);

// Remove driver availability by availability ID
router.delete("/availability/:id", driverController.removeDriverAvailability);

// Find available drivers based on company ID and request time
router.get("/avalibleDrivers", driverController.findAvailableDrivers);

module.exports = router;
