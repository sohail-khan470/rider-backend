// src/controllers/locationController.js
const { StatusCodes } = require("http-status-codes");
const locationService = require("./location-service");
const { AppError } = require("../utils/errorUtils");

async function updateDriverLocation(req, res, next) {
  try {
    const { driverId } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      throw new AppError(
        "Latitude and longitude are required",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppError(
        "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180",
        StatusCodes.BAD_REQUEST
      );
    }

    const location = await locationService.updateDriverLocation(
      driverId,
      parseFloat(lat),
      parseFloat(lng)
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver location updated successfully",
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

async function getDriverLocation(req, res, next) {
  try {
    const { driverId } = req.params;
    const location = await locationService.getDriverLocation(driverId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver location retrieved successfully",
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

async function getNearbyDrivers(req, res, next) {
  try {
    const { companyId, lat, lng, radius } = req.query;

    if (!companyId || !lat || !lng) {
      throw new AppError(
        "Company ID, latitude, and longitude are required",
        StatusCodes.BAD_REQUEST
      );
    }

    // Validate coordinates
    if (
      parseFloat(lat) < -90 ||
      parseFloat(lat) > 90 ||
      parseFloat(lng) < -180 ||
      parseFloat(lng) > 180
    ) {
      throw new AppError(
        "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180",
        StatusCodes.BAD_REQUEST
      );
    }

    const radiusInKm = radius ? parseFloat(radius) : 5;

    const drivers = await locationService.getNearbyDrivers(
      companyId,
      parseFloat(lat),
      parseFloat(lng),
      radiusInKm
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Nearby drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  getNearbyDrivers,
};
