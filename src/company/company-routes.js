// src/routes/companyRoutes.js
const express = require("express");
const router = express.Router();
const companyController = require("./companyController");

// Company registration
router.post("/register", companyController.createCompany);

// Company login
router.post("/login", companyController.loginCompany);

// Get all companies (with optional filters)
router.get("/", companyController.listCompanies);

// Get single company by ID
router.get("/:id", companyController.getCompanyById);

// Update company
router.patch("/:id", companyController.updateCompany);

// Approve company (admin only)
router.patch("/:id/approve", companyController.approveCompany);

// Delete company
router.delete("/:id", companyController.deleteCompany);

module.exports = router;
