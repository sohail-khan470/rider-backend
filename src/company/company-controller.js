const { StatusCodes } = require("http-status-codes");
const companyService = require("./company-service");
const { get } = require("./company-routes");

// Create a new company
async function createCompany(req, res, next) {
  try {
    const company = await companyService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

async function editCompany(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.edit(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

// Get all companies with optional filters and pagination
async function getAllCompanies(req, res, next) {
  try {
    const result = await companyService.findAll(filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Companies retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// Get a company by ID
async function getCompanyById(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.findById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company retrieved successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

// Update a company
async function updateCompany(req, res, next) {
  try {
    const { id } = req.params;
    const company = await companyService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

// Delete a company
async function deleteCompany(req, res, next) {
  console.log("delete company");
  try {
    const { id } = req.params;
    const result = await companyService.delete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Approve a company
async function approveCompany(req, res, next) {
  try {
    const { id } = req.params;
    const result = await companyService.approveCompany(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company approved successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Authenticate a company
async function loginCompany(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const company = await companyService.authenticate(email, password);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

async function getStaffByCompany(req, res, next) {
  try {
    const { id } = req.params;

    const company = await companyService.findById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company retrieved successfully",
      data: company,
    });
  } catch (error) {
    next(error);
  }
}

async function getCustomersByCompany(req, res, next) {
  console.log("@get-CustomerBy Company");
  try {
    const { companyId } = req.params;
    const customers = await companyService.getCustomerByCompany(companyId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customers retrieved successfully",
      customers,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStaff(req, res, next) {
  try {
    const { id } = req.params;
    const staff = await companyService.updateStaff(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Staff updated successfully",
      staff,
    });
  } catch (error) {
    next(error);
  }
}

async function getCompanyProfile(req, res, next) {
  const companyID = req.user.companyId;
  try {
    if (companyID) {
      const company = await companyService.findById(companyID);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Company retrieved successfully",
        company,
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  approveCompany,
  loginCompany,
  getStaffByCompany,
  getCustomersByCompany,
  updateStaff,
  getCompanyProfile,
};
