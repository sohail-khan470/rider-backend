const staffController = require("./staff-controller");
const router = require("express").Router();

router.post("/create", staffController.createStaff);
router.get("/get/:id", staffController.getStaff);
