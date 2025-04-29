const express = require("express");
const router = express.Router();
const controller = require("./customer-controller");

router.post("/", controller.createCustomer);
router.get("/:id", controller.getCustomer);
router.get("/", controller.getAllCustomers);

module.exports = router;
