const express = require("express");
const router = express.Router();
const bookingController = require("./booking-controller");

// Create a new booking
router.post("/", bookingController.createBooking);

// Get booking by ID
router.get("/:id", bookingController.getBookingById);

// List bookings for a company (with optional filters)
router.get("/company/:companyId", bookingController.listBookings);

// Assign driver to booking
router.patch(
  "/:bookingId/assign-driver/:driverId",
  bookingController.assignDriverToBooking
);

// Update booking status
router.patch("/:bookingId/status", bookingController.updateBookingStatus);

// Find nearby drivers for a booking
router.get("/:bookingId/nearby-drivers", bookingController.findNearbyDrivers);

module.exports = router;
