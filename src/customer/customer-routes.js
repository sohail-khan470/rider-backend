const express = require("express");
const router = express.Router();
const customerController = require("./customer-controller");

router.post("/", customerController.createCustomer);

router.get("/getAll", customerController.getAllCustomers);

router.get("/:id", customerController.getCustomerById);

router.patch("/:id", customerController.updateCustomer);

router.delete("/:id", customerController.deleteCustomer);

router.get(
  "/:id/bookings",

  customerController.getCustomerBookings
);

router.get("/:companyId/customers", customerController.getCustomersByCompany);

module.exports = router;
