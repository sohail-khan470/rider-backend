// src/routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const customerController = require("./customer-controller");

//get all customers

router.get("/getAll", customerController.getAllCustomers);

// Create a customer
router.post("/register", customerController.createCustomer);

// Get a customer by ID
router.get("/:id", customerController.getCustomerById);

// List customers by companyId with optional search
router.get("/", customerController.listCustomers);

// Update a customer by ID
router.put("/:id", customerController.updateCustomer);

// Delete a customer by ID
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;
