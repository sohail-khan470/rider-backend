const express = require("express");
const router = express.Router();
const driverController = require("./drivers-controller");

router.put("/:id/location", driverController.updateDriverLocation);
// Nearby drivers route
router.get("/nearby", driverController.getNearbyDrivers);
// Driver status routes (specific ID)
router.patch("/:id/status", driverController.updateDriverStatus);

// Driver CRUD routes (specific ID)
router.get("/:id", driverController.getDriverById);
router.put("/:id", driverController.updateDriver);
router.delete("/:id", driverController.deleteDriver);

// Driver availability routes
router.post("/availability", driverController.addDriverAvailability);
router.delete("/availability/:id", driverController.removeDriverAvailability);

// Drivers by city route
router.get("/city/:cityId", driverController.getDriversByCity);

// Drivers by company route
router.get("/company/:companyId", driverController.getDriversByCompany);

// General driver routes (least specific)
router.post("/", driverController.createDriver);
router.get("/", driverController.getAllDrivers);

module.exports = router;
