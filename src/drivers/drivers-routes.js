const express = require("express");
const router = express.Router();
const driverController = require("./drivers-service");

// Driver CRUD routes
router.post(
  "/",

  driverController.create
);
router.get("/", driverController.findAll);
router.get("/:id", driverController.findById);
router.put(
  "/:id",

  driverController.update
);
router.delete("/:id", driverController.delete);

// Driver status routes
router.patch("/:id/status", driverController.update);

// Driver location routes
router.put("/:id/location", driverController.updateLocation);

// Driver availability routes
router.post("/availability", driverController.addAvailability);
router.delete("/availability/:id", driverController.removeAvailability);

// Nearby drivers route
router.get("/nearby", driverController.getNearbyDrivers);

module.exports = router;
