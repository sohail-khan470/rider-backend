const express = require("express");
const router = express.Router();
const companyAdminController = require("./companyAdminController");

// Create a company admin
router.post("/", companyAdminController.createCompanyAdmin);

// Company admin login
router.post("/login", companyAdminController.loginCompanyAdmin);

// Get company admin by ID
router.get("/:id", companyAdminController.getCompanyAdminById);

// Update company admin
router.put("/:id", companyAdminController.updateCompanyAdmin);

module.exports = router;
