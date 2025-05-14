const express = require("express");
const router = express.Router();
const bookingController = require("./booking-controller");

router.post("/company", bookingController.getBookingsByCompany);

router.post("/", bookingController.createBooking);

router.get("/", bookingController.getAllBookings);

router.get("/:id", bookingController.getBookingById);

router.put(
  "/:id",

  bookingController.updateBooking
);

router.patch(
  "/:id/assign-driver",

  bookingController.assignDriver
);

router.patch("/:id/cancel", bookingController.cancelBooking);

router.patch("/:id/complete", bookingController.completeBooking);

router.get("/stats/:companyId", bookingController.getBookingStatistics);

module.exports = router;
