// module.exports = router;
const express = require("express");
const router = express.Router();
const bookingController = require("./booking-controller");

// Create a new booking
router.post("/create", bookingController.createBooking);

// Get a booking by ID
router.get("/:id", bookingController.getBookingById);

// Get bookings by company (moved companyId to query param)
router.get("/getAllBookings", bookingController.listBookings); // Use /?companyId=...

// Assign a driver to a booking (use bookingId in param  driverId in body )
router.patch("/:id/assign-driver", bookingController.assignDriverToBooking); // driverId in body or query

// Update booking status
router.patch("/:id/updatebookingStatus", bookingController.updateBookingStatus);

// Find nearby drivers for a booking
router.get("/:id/findNearByDrivers", bookingController.findNearbyDrivers);

module.exports = router;
