const companyService = require("./company-service");

// Controller for company registration
const registerCompany = async (req, res) => {
  try {
    const companyData = req.body;

    // Call the service to register the company
    const company = await companyService.registerCompany(companyData);

    // Send success response
    res.status(201).json({
      message: "Company registered successfully!",
      error: {},
      data: company,
      success: true,
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({
      message: error.message || "Failed to register company",
      error: error.details || error,
      data: null,
      success: false,
    });
  }
};

module.exports = {
  registerCompany,
};
