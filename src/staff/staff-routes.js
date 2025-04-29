// src/routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const staffController = require("./staff-controller");

// Create a new staff member
router.post("/register", staffController.createStaff);

// Staff login
router.post("/login", staffController.loginStaff);

// Get staff by ID
router.get("/:id", staffController.getStaffById);

// List all staff for a company
router.get("/getAllStaff", staffController.listStaff);

// Update staff member
router.put("/:id", staffController.updateStaff);

// Delete staff member
router.delete("/:id", staffController.deleteStaff);

module.exports = router;
