const { StatusCodes } = require("http-status-codes");
const scheduleService = require("./schedule-service");

// Create a new schedule
async function createSchedule(req, res) {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Schedule created successfully",
      data: schedule,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Update a schedule
async function updateSchedule(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.updateSchedule(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Schedule updated successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Cancel a schedule
async function cancelSchedule(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.cancelSchedule(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Schedule cancelled successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Start a trip
async function startTrip(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.startTrip(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Trip started successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Mark schedule as arrived
async function markArrived(req, res) {
  try {
    const { id } = req.params;
    const { returnTime } = req.body;
    const schedule = await scheduleService.markArrived(
      id,
      returnTime ? new Date(returnTime) : null
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Arrival marked successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Start return trip
async function startReturn(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.startReturn(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Return trip started successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Complete schedule
async function completeSchedule(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.completeSchedule(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Schedule completed successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Get available return schedules
async function getAvailableReturnSchedules(req, res) {
  try {
    const { cityId, destinationCityId } = req.params;
    const { date } = req.query;

    const schedules = await scheduleService.getAvailableReturnSchedules(
      parseInt(cityId),
      parseInt(destinationCityId),
      date ? new Date(date) : null
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Available return schedules retrieved successfully",
      data: schedules,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Get schedule by ID
async function getScheduleById(req, res) {
  try {
    const { id } = req.params;
    const schedule = await scheduleService.getScheduleById(parseInt(id));
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Schedule retrieved successfully",
      data: schedule,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

// Get company schedules
async function getCompanySchedules(req, res) {
  try {
    const { companyId } = req.params;
    const { status, startDate, endDate } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const schedules = await scheduleService.getCompanySchedules(
      parseInt(companyId),
      filters
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company schedules retrieved successfully",
      data: schedules,
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createSchedule,
  updateSchedule,
  cancelSchedule,
  startTrip,
  markArrived,
  startReturn,
  completeSchedule,
  getAvailableReturnSchedules,
  getScheduleById,
  getCompanySchedules,
};
