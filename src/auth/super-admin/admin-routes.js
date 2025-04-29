const express = require("express");
const router = express.Router();
const superAdminController = require("./admin-controller");

// Route to create a super admin
router.post("/register", superAdminController.createSuperAdmin);

// Route to login a super admin
router.post(
  "/login",

  superAdminController.loginSuperAdmin
);

// Route to get a super admin by ID
router.get(
  "/:id",

  superAdminController.getSuperAdminById
);

// Route to update a super admin
router.put("/:id", superAdminController.updateSuperAdmin);

module.exports = router;
