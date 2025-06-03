const { StatusCodes } = require("http-status-codes");
const customerService = require("./customer-service");

// Create a new customer
async function createCustomer(req, res, next) {
  try {
    const customer = await customerService.create(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

async function getCustomersByCompany(req, res, next) {
  try {
    const customers = await customerService.getCustomerByCompanyId(
      req.user.companyId
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customers retrieved successfully",
      customers,
    });
  } catch (error) {}
}

// Get all customers with optional filters and pagination
async function getAllCustomers(req, res, next) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const pagination = {
      skip: (page - 1) * limit,
      take: parseInt(limit),
    };

    const result = await customerService.findAll(filters, pagination);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customers retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// Get a customer by ID
async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await customerService.findById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

// Update a customer
async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await customerService.update(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

// Delete a customer
async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const result = await customerService.delete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Get customer bookings
async function getCustomerBookings(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pagination = {
      skip: (page - 1) * limit,
      take: parseInt(limit),
    };

    const result = await customerService.getCustomerBookings(id, pagination);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer bookings retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerBookings,
  getCustomersByCompany,
};
