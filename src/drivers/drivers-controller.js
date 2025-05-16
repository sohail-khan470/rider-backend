const { StatusCodes } = require("http-status-codes");
const driverService = require("./drivers-service");

// Create a new driver
async function createDriver(req, res, next) {
  try {
    const driver = await driverService.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Driver created successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
}

// Get all drivers with optional filters and pagination
async function getAllDrivers(req, res, next) {
  try {
    const companyId = req.query.companyId;
    const { filters } = req.query;
    const result = await driverService.findAll(filters, companyId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// Get a driver by ID
async function getDriverById(req, res, next) {
  try {
    const { id } = req.params;
    const driver = await driverService.findById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver retrieved successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
}

// Update a driver
async function updateDriver(req, res, next) {
  try {
    const { id } = req.params;
    const driver = await driverService.update(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver updated successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
}

// Delete a driver
async function deleteDriver(req, res, next) {
  try {
    const { id } = req.params;
    await driverService.delete(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Update driver status
async function updateDriverStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const driver = await driverService.updateStatus(id, status);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver status updated successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
}

// Update driver location
async function updateDriverLocation(req, res, next) {
  try {
    const { id } = req.params;
    const location = await driverService.updateLocation(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver location updated successfully",
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

// Add driver availability
async function addDriverAvailability(req, res, next) {
  try {
    const availability = await driverService.addAvailability(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Driver availability added successfully",
      data: availability,
    });
  } catch (error) {
    next(error);
  }
}

// Remove driver availability
async function removeDriverAvailability(req, res, next) {
  try {
    const { id } = req.params;
    await driverService.removeAvailability(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver availability removed successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Get nearby drivers
async function getNearbyDrivers(req, res, next) {
  try {
    const { lat, lng, radius, companyId, cityId } = req.query;
    const drivers = await driverService.getNearbyDrivers(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 5,
      companyId ? parseInt(companyId) : null,
      cityId ? parseInt(cityId) : null
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

// Get drivers by city
async function getDriversByCity(req, res, next) {
  try {
    const { cityId } = req.params;
    const { status } = req.query;
    const drivers = await driverService.getDriversByCity(cityId, status);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
}

async function getDriversByCompany(req, res, next) {
  try {
    const { companyId } = req.params;
    const { status } = req.query;
    const drivers = await driverService.getDriversByCompany(companyId, status);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Drivers retrieved successfully",
      drivers,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
  updateDriverLocation,
  addDriverAvailability,
  removeDriverAvailability,
  getNearbyDrivers,
  getDriversByCity,
  getDriversByCompany,
};
