const express = require("express");
const router = express.Router();
const scheduleController = require("./schedule-controller");

// Schedule routes
router.post("/", scheduleController.createSchedule);
router.put("/:id", scheduleController.updateSchedule);
router.patch("/:id/cancel", scheduleController.cancelSchedule);
router.patch("/:id/start", scheduleController.startTrip);
router.patch("/:id/arrived", scheduleController.markArrived);
router.patch("/:id/return", scheduleController.startReturn);
router.patch("/:id/complete", scheduleController.completeSchedule);

// Get routes
router.get(
  "/available-return/:cityId/:destinationCityId",
  scheduleController.getAvailableReturnSchedules
);
router.get("/:id", scheduleController.getScheduleById);
router.get("/company/:companyId", scheduleController.getCompanySchedules);

module.exports = router;
