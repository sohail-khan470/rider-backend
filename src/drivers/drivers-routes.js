const express = require("express");
const router = express.Router();
const driverController = require("./drivers-controller");

// Driver CRUD routes
router.post("/", driverController.createDriver);
router.get("/", driverController.getAllDrivers);
router.get("/:id", driverController.getDriverById);
router.put("/:id", driverController.updateDriver);
router.delete("/:id", driverController.deleteDriver);

// Driver status routes
router.patch("/:id/status", driverController.updateDriverStatus);

// Driver location routes
router.put("/:id/location", driverController.updateDriverLocation);

// Driver availability routes
router.post("/availability", driverController.addDriverAvailability);
router.delete("/availability/:id", driverController.removeDriverAvailability);

// Nearby drivers route
router.get("/nearby", driverController.getNearbyDrivers);

// Drivers by city route - Note: This must be placed before the "/:id" route
router.get("/city/:cityId", driverController.getDriversByCity);

module.exports = router;
