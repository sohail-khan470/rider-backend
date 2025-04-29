// src/controllers/customerController.js
const { StatusCodes } = require("http-status-codes");
const customerService = require("../services/customerService");
const { AppError } = require("../utils/errorUtils");

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

async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await customerService.getById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}

async function listCustomers(req, res, next) {
  try {
    const { companyId } = req.query;
    const searchQuery = req.query.search || "";

    if (!companyId) {
      throw new AppError("Company ID is required", StatusCodes.BAD_REQUEST);
    }

    const customers = await customerService.list(companyId, searchQuery);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customers retrieved successfully",
      data: customers,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const updatedCustomer = await customerService.update(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    await customerService.delete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
  deleteCustomer,
};
