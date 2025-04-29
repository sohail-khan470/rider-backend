// src/routes/staffRoleRoutes.js
const express = require("express");
const router = express.Router();
const staffRoleController = require("./staffRoleController");

// Create a new staff role
router.post("/", staffRoleController.createStaffRole);

// Get all staff roles
router.get("/", staffRoleController.listStaffRoles);

// Get a specific staff role by ID
router.get("/:id", staffRoleController.getStaffRoleById);

// Update a staff role
router.put("/:id", staffRoleController.updateStaffRole);

// Delete a staff role
router.delete("/:id", staffRoleController.deleteStaffRole);

module.exports = router;
