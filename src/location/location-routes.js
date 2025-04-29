// src/routes/locationRoutes.js
const express = require("express");
const router = express.Router();
const locationController = require("./location-controller");

// Update driver's location
router.put(
  "/drivers/:driverId/location",
  locationController.updateDriverLocation
);

// Get driver's current location
router.get(
  "/drivers/:driverId/getLocation",
  locationController.getDriverLocation
);

// Get nearby drivers for a company
router.get("/nearby-drivers", locationController.getNearbyDrivers);

module.exports = router;
