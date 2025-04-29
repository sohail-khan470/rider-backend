// src/controllers/superAdminController.js
const { StatusCodes } = require("http-status-codes");
const superAdminService = require("./admin-service");
const { AppError } = require("../../utils/errorUtils");

async function createSuperAdmin(req, res, next) {
  try {
    const superAdmin = await superAdminService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Super admin created successfully",
      data: {
        id: superAdmin.id,
        email: superAdmin.email,
        createdAt: superAdmin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function loginSuperAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await superAdminService.login(email, password);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Super admin login successful",
      data: {
        token: result.token,
        superAdmin: result.superAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getSuperAdminById(req, res, next) {
  try {
    const { id } = req.params;
    const superAdmin = await superAdminService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Super admin retrieved successfully",
      data: {
        id: superAdmin.id,
        email: superAdmin.email,
        createdAt: superAdmin.createdAt,
        updatedAt: superAdmin.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateSuperAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const updatedSuperAdmin = await superAdminService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Super admin updated successfully",
      data: {
        id: updatedSuperAdmin.id,
        email: updatedSuperAdmin.email,
        updatedAt: updatedSuperAdmin.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSuperAdmin,
  loginSuperAdmin,
  getSuperAdminById,
  updateSuperAdmin,
};
