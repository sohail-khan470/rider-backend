const { StatusCodes } = require("http-status-codes");
const companyService = require("./company-service");

// Create a new company
async function createCompany(req, res) {
  const company = await companyService.create(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Company created successfully",
    data: company,
  });
}

async function editCompany(req, res) {
  console.log("$$$$$$Edit Company");
  console.log(req.params);
  const { id } = req.params;
  const company = await companyService.edit(id, req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Company updated successfully",
    data: company,
  });
}

// Get all companies with optional filters and pagination
async function getAllCompanies(req, res) {
  const { filters } = req.query;
  const result = await companyService.findAll(filters);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Companies retrieved successfully",
    data: result.data,
    pagination: result.pagination,
  });
}

// Get a company by ID
async function getCompanyById(req, res) {
  console.log("@get single company");

  const { id } = req.params;
  const company = await companyService.findById(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Company retrieved successfully",
    data: company,
  });
}

// Update a company
async function updateCompany(req, res) {
  console.log("$$$$$$$$$$updating company");
  console.log(req.params);
  const { id } = req.params;
  const response = await companyService.update(id, req.body);
  console.log(response);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Company updated successfully",
    data: response,
  });
}

// Delete a company
async function deleteCompany(req, res) {
  console.log("delete company");
  const { id } = req.params;
  await companyService.delete(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Company deleted successfully",
  });
}

// Approve a company
async function approveCompany(req, res) {
  const { id } = req.params;
  await companyService.approveCompany(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Company approved successfully",
  });
}

// Authenticate a company
async function loginCompany(req, res) {
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
}

async function getStaffByCompany(req, res) {
  const { id } = req.params;
  const company = await companyService.findById(id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Company retrieved successfully",
    data: company,
  });
}

async function getCustomersByCompany(req, res) {
  console.log("@get-CustomerBy Company");
  const { companyId } = req.params;
  const customers = await companyService.getCustomerByCompany(companyId);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Customers retrieved successfully",
    customers,
  });
}

async function updateStaff(req, res) {
  const { id } = req.params;
  const staff = await companyService.updateStaff(id, req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Staff updated successfully",
    staff,
  });
}

async function getCompanyProfile(req, res) {
  const companyID = req.user.companyId;
  if (companyID) {
    const company = await companyService.findById(companyID);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company retrieved successfully",
      company,
    });
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
  editCompany,
};
