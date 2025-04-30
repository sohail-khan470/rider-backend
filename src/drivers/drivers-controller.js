// src/controllers/driverController.js
const { StatusCodes } = require("http-status-codes");
const driverService = require("./drivers-service");
const { AppError } = require("../utils/errorUtils");

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

async function listAllDrivers(req, res, next) {
  try {
    const drivers = await driverService.listAll();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "All drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
}

async function getDriverById(req, res, next) {
  try {
    const { id } = req.params;
    const driver = await driverService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver retrieved successfully",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
}

async function listDrivers(req, res, next) {
  try {
    const { companyId } = req.query;
    const filters = {
      status: req.query.status,
    };

    if (!companyId) {
      throw new AppError("Company ID is required", StatusCodes.BAD_REQUEST);
    }

    const drivers = await driverService.list(companyId, filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
}

async function updateDriver(req, res, next) {
  try {
    const { id } = req.params;
    const updatedDriver = await driverService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
}

async function updateDriverStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError("Status is required", StatusCodes.BAD_REQUEST);
    }

    const updatedDriver = await driverService.updateStatus(id, status);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Driver status updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
}

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

async function addDriverAvailability(req, res, next) {
  try {
    const { driverId, startTime, endTime } = req.body;

    if (!driverId || !startTime || !endTime) {
      throw new AppError(
        "Driver ID, start time and end time are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const availability = await driverService.addAvailability(
      driverId,
      startTime,
      endTime
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Driver availability added successfully",
      data: availability,
    });
  } catch (error) {
    next(error);
  }
}

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

async function findAvailableDrivers(req, res, next) {
  try {
    const { companyId, requestTime } = req.query;

    if (!companyId || !requestTime) {
      throw new AppError(
        "Company ID and request time are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const drivers = await driverService.findAvailableDrivers(
      companyId,
      requestTime
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Available drivers retrieved successfully",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDriver,
  getDriverById,
  listDrivers,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
  addDriverAvailability,
  removeDriverAvailability,
  findAvailableDrivers,
  listAllDrivers,
};
