// src/controllers/bookingController.js
const { StatusCodes } = require("http-status-codes");
const bookingService = require("./booking-service");

// Create a new booking
async function createBooking(req, res, next) {
  console.log("@Create bookings");
  console.log(req.body);
  try {
    const booking = await bookingService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

async function getBookingsByCompany(req, res, next) {
  console.log("@Booking by company");
  const companyId = req.body.companyId;
  console.log(companyId);
  try {
    const result = await bookingService.getBookingsByCompany(companyId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Bookings retrieved successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
}

// Get all bookings with optional filters and pagination
async function getAllBookings(req, res, next) {
  console.log("@get all bookings");
  try {
    const { filters } = req.query;

    const result = await bookingService.findAll(filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// Get a booking by ID
async function getBookingById(req, res, next) {
  console.log("@get single booking");
  try {
    const { id } = req.params;
    const booking = await bookingService.findById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

// Update a booking
async function updateBooking(req, res, next) {
  console.log("@Update Booking");
  try {
    const { id } = req.params;
    const booking = await bookingService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

// Assign a driver to a booking
async function assignDriver(req, res, next) {
  console.log("@Assing Driver");
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    const booking = await bookingService.assignDriver(id, driverId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver assigned successfully",
      data: booking,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

// Cancel a booking
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const result = await bookingService.cancelBooking(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Complete a booking
async function completeBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { fare } = req.body;
    const booking = await bookingService.completeBooking(id, { fare });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking completed successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

// Get booking statistics
async function getBookingStatistics(req, res, next) {
  try {
    const { companyId } = req.params;
    const { period = "day" } = req.query;
    const stats = await bookingService.getBookingStatistics(companyId, period);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

// Accept a booking (new function)
async function acceptBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingService.acceptBooking(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking accepted successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

// Complete a booking (already exists)
async function completeBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { fare } = req.body;
    const booking = await bookingService.completeBooking(id, { fare });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking completed successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  assignDriver,
  cancelBooking,
  acceptBooking, // Export the new function
  completeBooking,
  getBookingStatistics,
  getBookingsByCompany,
};
