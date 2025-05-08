const express = require("express");
const userController = require("./user-controller");

const router = express.Router();

// Auth route
router.post("/auth", userController.authenticateUser);

// CRUD routes
router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/admins/:companyId", userController.getAdminUsers);

module.exports = router;
