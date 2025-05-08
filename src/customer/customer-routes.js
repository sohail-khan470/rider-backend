const express = require("express");
const router = express.Router();
const customerController = require("./customer-controller");

router.post("/", customerController.createCustomer);

router.get("/", customerController.getAllCustomers);

router.get("/:id", customerController.getCustomerById);

router.put(
  "/:id",

  customerController.updateCustomer
);

router.delete("/:id", customerController.deleteCustomer);

router.get(
  "/:id/bookings",

  customerController.getCustomerBookings
);

module.exports = router;
