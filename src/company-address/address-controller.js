const { StatusCodes } = require("http-status-codes");
const addressService = require("./address-service");

// Create a new company address
async function createAddress(req, res) {
  try {
    const address = await addressService.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all addresses with optional filters
async function getAllAddresses(req, res) {
  try {
    const { filters } = req.query;
    const result = await addressService.findAll(filters);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: result.data,
      count: result.count,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Get an address by ID
async function getAddressById(req, res) {
  try {
    const { id } = req.params;
    const address = await addressService.findById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error) {
    const statusCode =
      error.message === "Address not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Get addresses by company ID
async function getAddressesByCompanyId(req, res) {
  try {
    const { companyId } = req.params;
    const addresses = await addressService.findByCompanyId(companyId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Get primary address by company ID
async function getPrimaryAddress(req, res) {
  try {
    const { companyId } = req.params;
    const address = await addressService.findPrimaryByCompanyId(companyId);

    if (!address) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Primary address not found for this company",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Primary address retrieved successfully",
      data: address,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Update an address
async function updateAddress(req, res) {
  try {
    const { id } = req.params;
    const updatedAddress = await addressService.update(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    const statusCode =
      error.message === "Address not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete an address
async function deleteAddress(req, res) {
  try {
    const { id } = req.params;
    await addressService.delete(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Address not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Set address as primary
async function setPrimaryAddress(req, res) {
  try {
    const { id } = req.params;
    const updatedAddress = await addressService.setPrimary(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Primary address set successfully",
      data: updatedAddress,
    });
  } catch (error) {
    const statusCode =
      error.message === "Address not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Get current user's company addresses
async function getMyCompanyAddresses(req, res) {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Company ID not found in user context",
      });
    }

    const addresses = await addressService.findByCompanyId(companyId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Get current user's company primary address
async function getMyCompanyPrimaryAddress(req, res) {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Company ID not found in user context",
      });
    }

    const address = await addressService.findPrimaryByCompanyId(companyId);

    if (!address) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Primary address not found for your company",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company primary address retrieved successfully",
      data: address,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  getAddressesByCompanyId,
  getPrimaryAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
  getMyCompanyAddresses,
  getMyCompanyPrimaryAddress,
};
