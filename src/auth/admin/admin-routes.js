const express = require("express");
const router = express.Router();
const adminController = require("./admin-controller");

/*
POST    /superadmin/login
GET     /superadmin/companies                  // view all
PATCH   /superadmin/companies/:id/approve      // approve company
PATCH   /superadmin/companies/:id/suspend      // suspend company
*/

router.post("/login", adminController.login);
router.post("/register", adminController.createAdmin);
router.get("/admins", adminController.getAllAdmins);
router.get("/admins/:id", adminController.getAdminById);
router.patch("/admins/:id", adminController.updateAdmin);
router.delete("/admins/:id", adminController.deleteAdmin);

// router.get("/companies", adminController.getAllCompanies);
// router.patch("/companies/:id/approve", adminController.approveCompany);
// router.patch("/companies/:id/suspend", adminController.suspendCompany);

module.exports = router;
