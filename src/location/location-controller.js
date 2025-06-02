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
      parseInt(driverId),
      parseFloat(lat),
      parseFloat(lng)
    );

    res.status(StatusCodes.OK).json(location);
  } catch (error) {
    next(error);
  }
}

async function getDriverLocation(req, res, next) {
  try {
    const { driverId } = req.params;
    const location = await locationService.getDriverLocation(
      parseInt(driverId)
    );

    res.status(StatusCodes.OK).json(location);
  } catch (error) {
    next(error);
  }
}

async function searchLocation(req, res, next) {
  try {
    const { searchTerm } = req.body;

    if (!searchTerm) {
      throw new AppError("Search term is required", StatusCodes.BAD_REQUEST);
    }

    const locations = await locationService.searchLocation(searchTerm);
    res.status(StatusCodes.OK).json(locations);
  } catch (error) {
    next(error);
  }
}

async function getAllLocations(req, res, next) {
  try {
    const locations = await locationService.getAllLocations();
    res.status(StatusCodes.OK).json(locations);
  } catch (error) {
    next(error);
  }
}

async function getLocationById(req, res, next) {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(parseInt(id));
    res.status(StatusCodes.OK).json(location);
  } catch (error) {
    next(error);
  }
}

async function createLocation(req, res, next) {
  try {
    const locationData = req.body;
    const location = await locationService.createLocation(locationData);
    res.status(StatusCodes.CREATED).json(location);
  } catch (error) {
    next(error);
  }
}

async function updateLocation(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const location = await locationService.updateLocation(
      parseInt(id),
      updateData
    );
    res.status(StatusCodes.OK).json(location);
  } catch (error) {
    next(error);
  }
}

async function deleteLocation(req, res, next) {
  try {
    const { id } = req.params;
    await locationService.deleteLocation(parseInt(id));
    res.status(StatusCodes.NO_CONTENT).send();
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
      parseInt(companyId),
      parseFloat(lat),
      parseFloat(lng),
      radiusInKm
    );

    res.status(StatusCodes.OK).json(drivers);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  searchLocation,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyDrivers,
};
