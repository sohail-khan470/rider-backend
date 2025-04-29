// src/controllers/staffRoleController.js
const { StatusCodes } = require("http-status-codes");
const staffRoleService = require("../services/staffRoleService");
const { AppError } = require("../utils/errorUtils");

async function createStaffRole(req, res, next) {
  try {
    const { name } = req.body;

    if (!name) {
      throw new AppError("Role name is required", StatusCodes.BAD_REQUEST);
    }

    const staffRole = await staffRoleService.create({ name });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Staff role created successfully",
      data: staffRole,
    });
  } catch (error) {
    next(error);
  }
}

async function getStaffRoleById(req, res, next) {
  try {
    const { id } = req.params;
    const staffRole = await staffRoleService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff role retrieved successfully",
      data: staffRole,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStaffRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      throw new AppError("Role name is required", StatusCodes.BAD_REQUEST);
    }

    const updatedStaffRole = await staffRoleService.update(id, { name });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff role updated successfully",
      data: updatedStaffRole,
    });
  } catch (error) {
    next(error);
  }
}

async function listStaffRoles(req, res, next) {
  try {
    const staffRoles = await staffRoleService.list();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff roles retrieved successfully",
      data: staffRoles,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteStaffRole(req, res, next) {
  try {
    const { id } = req.params;
    await staffRoleService.deleteRole(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStaffRole,
  getStaffRoleById,
  updateStaffRole,
  listStaffRoles,
  deleteStaffRole,
};
