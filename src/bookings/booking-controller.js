// src/controllers/bookingController.js
const { StatusCodes } = require("http-status-codes");
const bookingService = require("../services/bookingService");
const { AppError } = require("../utils/errorUtils");

async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: booking.id,
        customerId: booking.customerId,
        driverId: booking.driverId,
        companyId: booking.companyId,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        fare: booking.fare,
        status: booking.status,
        requestedAt: booking.requestedAt,
        customer: {
          id: booking.customer.id,
          name: booking.customer.name,
          email: booking.customer.email,
        },
        ...(booking.driver && {
          driver: {
            id: booking.driver.id,
            name: booking.driver.name,
            phone: booking.driver.phone,
          },
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;
    const booking = await bookingService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking retrieved successfully",
      data: {
        id: booking.id,
        customerId: booking.customerId,
        driverId: booking.driverId,
        companyId: booking.companyId,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        fare: booking.fare,
        status: booking.status,
        requestedAt: booking.requestedAt,
        updatedAt: booking.updatedAt,
        customer: {
          id: booking.customer.id,
          name: booking.customer.name,
          email: booking.customer.email,
        },
        company: {
          id: booking.company.id,
          name: booking.company.name,
        },
        ...(booking.driver && {
          driver: {
            id: booking.driver.id,
            name: booking.driver.name,
            phone: booking.driver.phone,
            ...(booking.driver.location && {
              location: {
                lat: booking.driver.location.lat,
                lng: booking.driver.location.lng,
              },
            }),
          },
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listBookings(req, res, next) {
  try {
    const { companyId } = req.params;
    const filters = req.query;

    const bookings = await bookingService.list(companyId, filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings.map((booking) => ({
        id: booking.id,
        customerId: booking.customerId,
        driverId: booking.driverId,
        companyId: booking.companyId,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        fare: booking.fare,
        status: booking.status,
        requestedAt: booking.requestedAt,
        customer: {
          id: booking.customer.id,
          name: booking.customer.name,
        },
        ...(booking.driver && {
          driver: {
            id: booking.driver.id,
            name: booking.driver.name,
          },
        }),
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function assignDriverToBooking(req, res, next) {
  try {
    const { bookingId, driverId } = req.params;

    const booking = await bookingService.assignDriver(bookingId, driverId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver assigned successfully",
      data: {
        id: booking.id,
        status: booking.status,
        driverId: booking.driverId,
        customer: {
          id: booking.customer.id,
          name: booking.customer.name,
        },
        driver: {
          id: booking.driver.id,
          name: booking.driver.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError("Status is required", StatusCodes.BAD_REQUEST);
    }

    const booking = await bookingService.updateStatus(bookingId, status);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking status updated successfully",
      data: {
        id: booking.id,
        status: booking.status,
        customer: {
          id: booking.customer.id,
          name: booking.customer.name,
        },
        ...(booking.driver && {
          driver: {
            id: booking.driver.id,
            name: booking.driver.name,
          },
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function findNearbyDrivers(req, res, next) {
  try {
    const { bookingId } = req.params;

    const drivers = await bookingService.findNearbyDriversForBooking(bookingId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Nearby drivers retrieved successfully",
      data: drivers.map((driver) => ({
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        distance: driver.distance,
        location: {
          lat: driver.location.lat,
          lng: driver.location.lng,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getBookingById,
  listBookings,
  assignDriverToBooking,
  updateBookingStatus,
  findNearbyDrivers,
};
