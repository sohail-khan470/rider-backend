const express = require("express");
const router = express.Router();

const companyController = require("./company-controller");

router.post("/register", companyController.createCompany);
router.get("/:companyId/customers", companyController.getCustomersByCompany);

//get staff by company
router.get("/:id/users", companyController.getStaffByCompany);

router.get("/", companyController.getAllCompanies);

router.get("/:id", companyController.getCompanyById);

router.put(
  "/:id",

  companyController.updateCompany
);
router.patch("/:id", companyController.updateCompany);

router.delete("/:id", companyController.deleteCompany);

router.patch("/:id/approve", companyController.approveCompany);

router.patch("/staff/:id", companyController.updateStaff);

module.exports = router;
