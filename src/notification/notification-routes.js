const express = require("express");
const NotificationController = require("./notification-controller");

const router = express.Router();

// ================== POST Routes ==================
router.post("/", NotificationController.createNotification);
router.patch("/:companyId/read", NotificationController.markNotificationAsRead);
router.post(
  "/company/:companyId",
  NotificationController.createCompanyNotification
);

// ================== GET Routes (Most Specific First) ==================
router.get("/unread", NotificationController.getAllUnreadNotifications); // Before /:id
router.get("/recent", NotificationController.getRecentNotifications); // Before /:id
router.get("/search", NotificationController.searchNotifications); // Before /:id
router.get("/types", NotificationController.getNotificationTypes); // Before /type/:type
router.get("/type/:type", NotificationController.getNotificationsByType); // Before /:id

// Company-specific GET routes (most specific first)
router.get(
  "/company/:companyId/unread",
  NotificationController.getCompanyUnreadNotifications
);
router.get(
  "/:companyId/recent",
  NotificationController.getRecentCompanyNotifications
);

router.get(
  "/:companyId/getAll",
  NotificationController.getCompanyNotifications
);

// Generic GET routes (after all specific ones)
router.get("/", NotificationController.getAllNotifications);
router.get("/:id", NotificationController.getNotificationById); // Now safe from conflicts

// ================== PATCH Routes ==================
router.patch(
  "/mark-all-read",
  NotificationController.markAllNotificationsAsRead
); // Before /:id/read
router.patch(
  "/company/:companyId/mark-all-read",
  NotificationController.markAllCompanyNotificationsAsRead
); // Before /company/:id/read
router.patch("/:id/read", NotificationController.markNotificationAsRead);
router.patch(
  "/company/:id/read",
  NotificationController.markCompanyNotificationAsRead
);

// ================== DELETE Routes ==================
router.delete("/:id", NotificationController.deleteNotification);
router.delete("/company/:id", NotificationController.deleteCompanyNotification);

module.exports = router;
