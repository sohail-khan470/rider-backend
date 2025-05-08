const express = require("express");
const router = express.Router();

const companyController = require("./company-controller");
// const { authenticate } = require("../middleware/authMiddleware");
// const { validateCompany } = require("../middleware/validationMiddleware");

router.post("/", companyController.createCompany);

//get staff by company
router.get("/:id/users", companyController.getStaffByCompany);

router.post("/login", companyController.loginCompany);

router.get("/", companyController.getAllCompanies);

router.get("/:id", companyController.getCompanyById);

router.put(
  "/:id",

  companyController.updateCompany
);

router.delete("/:id", companyController.deleteCompany);

router.patch("/:id/approve", companyController.approveCompany);

module.exports = router;
