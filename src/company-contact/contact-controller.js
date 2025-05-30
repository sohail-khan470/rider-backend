const { StatusCodes } = require("http-status-codes");
const contactService = require("./contact-service");

// Create a new company contact
async function createContact(req, res) {
  try {
    const contact = await contactService.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all contacts with optional filters
async function getAllContacts(req, res) {
  try {
    const { filters } = req.query;
    const result = await contactService.findAll(filters);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Contacts retrieved successfully",
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

// Get a contact by ID
async function getContactById(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Valid contact ID is required",
      });
    }

    const contact = await contactService.findById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Contact retrieved successfully",
      data: contact,
    });
  } catch (error) {
    const statusCode =
      error.message === "Contact not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Get contact by company ID
async function getContactByCompanyId(req, res) {
  try {
    const { companyId } = req.params;

    if (!companyId || isNaN(companyId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Valid company ID is required",
      });
    }

    const contact = await contactService.findByCompanyId(companyId);

    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Contact not found for this company",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Contact retrieved successfully",
      data: contact,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

// Update a contact
async function updateContact(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Valid contact ID is required",
      });
    }
    const updatedContact = await contactService.update(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    const statusCode =
      error.message === "Contact not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete a contact
async function deleteContact(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Valid contact ID is required",
      });
    }

    await contactService.delete(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error.message === "Contact not found"
        ? StatusCodes.NOT_FOUND
        : StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
}

// Get current user's company contact
async function getMyCompanyContact(req, res) {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Company ID not found in user context",
      });
    }

    const contact = await contactService.findByCompanyId(companyId);

    if (!contact) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Contact not found for your company",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Company contact retrieved successfully",
      data: contact,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  getContactByCompanyId,
  updateContact,
  deleteContact,
  getMyCompanyContact,
};
