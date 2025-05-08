// src/controllers/bookingController.js
const { StatusCodes } = require("http-status-codes");
const bookingService = require("./booking-service");

// Create a new booking
async function createBooking(req, res, next) {
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

// Get all bookings with optional filters and pagination
async function getAllBookings(req, res, next) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const pagination = {
      skip: (page - 1) * limit,
      take: parseInt(limit),
    };

    const result = await bookingService.findAll(filters, pagination);

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

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  assignDriver,
  cancelBooking,
  completeBooking,
  getBookingStatistics,
};
