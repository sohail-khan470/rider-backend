const { StatusCodes } = require("http-status-codes");
const bookingService = require("./booking-service");

// Create a new booking
async function createBooking(req, res, next) {
  const companyId = req.user.companyId;
  try {
    const booking = await bookingService.create(req.body, companyId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}

async function getBookingsByCompany(req, res, next) {
  const companyId = req.body.companyId;
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

async function getAllBookings(req, res, next) {
  try {
    const { filters } = req.query;

    const result = await bookingService.findAll(filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingService.findById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking retrieved successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}

async function updateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const booking = await bookingService.update(id, req.body, companyId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

//assign driver to a booking
async function assignDriver(req, res, next) {
  const companyId = req.user.companyId;
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    const booking = await bookingService.assignDriver(id, driverId, companyId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver assigned successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const result = await bookingService.cancelBooking(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking cancelled successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
}

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

async function acceptBooking(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingService.acceptBooking(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
}

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

async function startTrip(req, res, next) {
  const id = req.params.id;
  try {
    const booking = await bookingService.startTrip(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Trip started successfully",
      booking,
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
  acceptBooking,
  completeBooking,
  getBookingStatistics,
  getBookingsByCompany,
  startTrip,
};
