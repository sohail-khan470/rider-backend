// src/controllers/companyController.js
const { StatusCodes } = require("http-status-codes");
const companyService = require("../services/companyService");
const { AppError } = require("../utils/errorUtils");

async function createCompany(req, res, next) {
  try {
    const company = await companyService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Company created successfully. Pending approval.",
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        timezone: company.timezone,
        isApproved: company.isApproved,
        createdAt: company.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function loginCompany(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        "Email and password are required",
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await companyService.login(email, password);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company login successful",
      data: {
        token: result.token,
        company: result.company,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company retrieved successfully",
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        timezone: company.timezone,
        isApproved: company.isApproved,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        ...(company.admin && {
          admin: {
            id: company.admin.id,
            name: company.admin.name,
            email: company.admin.email,
          },
        }),
        drivers: company.drivers,
        staff: company.staff,
        customers: company.customers,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const updatedCompany = await companyService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company updated successfully",
      data: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        email: updatedCompany.email,
        timezone: updatedCompany.timezone,
        isApproved: updatedCompany.isApproved,
        updatedAt: updatedCompany.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listCompanies(req, res, next) {
  try {
    const filters = req.query;
    const companies = await companyService.list(filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Companies retrieved successfully",
      data: companies,
    });
  } catch (error) {
    next(error);
  }
}

async function approveCompany(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.approveCompany(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company approved successfully",
      data: {
        id: company.id,
        name: company.name,
        email: company.email,
        isApproved: company.isApproved,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCompany(req, res, next) {
  try {
    const { id } = req.params;
    await companyService.delete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCompany,
  loginCompany,
  getCompanyById,
  updateCompany,
  listCompanies,
  approveCompany,
  deleteCompany,
};
