const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { validateRequest } = require("../middlewares/validationMiddleware");
const {
  createRoleSchema,
  updateRoleSchema,
} = require("../validations/roleValidation");

// Role CRUD routes
router.post("/", validateRequest(createRoleSchema), roleController.createRole);
router.get("/", roleController.getAllRoles);
router.get("/:id", roleController.getRoleById);
router.put(
  "/:id",
  validateRequest(updateRoleSchema),
  roleController.updateRole
);
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
