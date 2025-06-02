// src/routes/locationRoutes.js
const express = require("express");
const router = express.Router();
const locationController = require("./location-controller");

// Driver location routes
router.put("/driverId/update", locationController.updateDriverLocation);
router.get("/driverId/getLocation", locationController.getDriverLocation);

// Location search and CRUD routes
router.post("/search", locationController.searchLocation);
router.get("/", locationController.getAllLocations);
router.get("/:id", locationController.getLocationById);
router.post("/", locationController.createLocation);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);

// Nearby drivers route
router.get("/nearby-drivers", locationController.getNearbyDrivers);

module.exports = router;
