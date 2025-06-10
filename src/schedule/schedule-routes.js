const express = require("express");
const router = express.Router();
const scheduleController = require("./schedule-controller");

// Specific routes first

router.get(
  "/available-return-schedules/",
  scheduleController.getAvailableReturnSchedules
);
// single schedule
router.get("/company/:companyId", scheduleController.getCompanySchedules);

// ID-based routes
router.get("/:id", scheduleController.getScheduleById);
router.put("/:id", scheduleController.updateSchedule);
router.patch("/:id/cancel", scheduleController.cancelSchedule);
router.patch("/:id/start", scheduleController.startTrip);
router.patch("/:id/arrived", scheduleController.markArrived);
router.patch("/:id/return", scheduleController.startReturn);
router.patch("/:id/complete", scheduleController.completeSchedule);

// General routes last
router.post("/", scheduleController.createSchedule);

module.exports = router;
