const express = require("express");
const router = express.Router();
const roleController = require("./roles-controller");

// Role CRUD routes
router.post("/", roleController.createRole);
router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

// Permission management routes
router.get("/permissions/all", roleController.getAllPermissions);
router.post(
  "/:roleId/permissions/:permissionId",
  roleController.addPermissionToRole
);
router.delete(
  "/:roleId/permissions/:permissionId",
  roleController.removePermissionFromRole
);

module.exports = router;
