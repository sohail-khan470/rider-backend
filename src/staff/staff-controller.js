// src/controllers/staffController.js
const { StatusCodes } = require("http-status-codes");
const staffService = require("../services/staffService");
const { AppError } = require("../utils/errorUtils");

async function createStaff(req, res, next) {
  try {
    const { name, email, password, roleId, companyId } = req.body;

    if (!name || !email || !password || !roleId || !companyId) {
      throw new AppError(
        "Name, email, password, role ID, and company ID are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const staff = await staffService.create({
      name,
      email,
      password,
      roleId,
      companyId,
    });

    // Remove password from response
    const { password: _, ...staffData } = staff;

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Staff created successfully",
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
}

async function loginStaff(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await staffService.login(email, password);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getStaffById(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await staffService.getById(id);

    // Remove password from response
    const { password, ...staffData } = staff;

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff retrieved successfully",
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
}

async function listStaff(req, res, next) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      throw new AppError("Company ID is required", StatusCodes.BAD_REQUEST);
    }

    const staffList = await staffService.list(companyId);

    // Remove passwords from response
    const sanitizedStaffList = staffList.map((staff) => {
      const { password, ...staffData } = staff;
      return staffData;
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff list retrieved successfully",
      data: sanitizedStaffList,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedStaff = await staffService.update(id, updateData);

    // Remove password from response
    const { password, ...staffData } = updatedStaff;

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff updated successfully",
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteStaff(req, res, next) {
  try {
    const { id } = req.params;
    await staffService.deleteStaff(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStaff,
  loginStaff,
  getStaffById,
  listStaff,
  updateStaff,
  deleteStaff,
};
