// src/controllers/companyAdminController.js
const { StatusCodes } = require("http-status-codes");
// const companyAdminService = require("../services/companyAdminService");
const companyAdminService = require("./admin-service");
const AppError = require("../utils/appError");

async function createCompanyAdmin(req, res, next) {
  try {
    const companyAdmin = await companyAdminService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Company admin created successfully",
      data: {
        id: companyAdmin.id,
        name: companyAdmin.name,
        email: companyAdmin.email,
        companyId: companyAdmin.companyId,
        createdAt: companyAdmin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function loginCompanyAdmin(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await companyAdminService.login(email, password);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        admin: result.admin,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyAdminById(req, res, next) {
  try {
    const { id } = req.params;
    const admin = await companyAdminService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company admin retrieved successfully",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        companyId: admin.companyId,
        company: {
          id: admin.company.id,
          name: admin.company.name,
          isApproved: admin.company.isApproved,
        },
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateCompanyAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const updatedAdmin = await companyAdminService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company admin updated successfully",
      data: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        companyId: updatedAdmin.companyId,
        updatedAt: updatedAdmin.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCompanyAdmin,
  loginCompanyAdmin,
  getCompanyAdminById,
  updateCompanyAdmin,
};
