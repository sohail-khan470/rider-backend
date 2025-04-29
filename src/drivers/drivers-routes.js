const express = require("express");
const router = express.Router();
const controller = require("./drivers-controller");

router.post("/", controller.createDriver);
router.get("/:id", controller.getDriver);
router.put("/:id/status", controller.updateStatus);
router.get("/", controller.getAllDrivers);

module.exports = router;
