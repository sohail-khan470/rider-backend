const { z } = require("zod");

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
  permissions: z
    .array(
      z.number().int().positive("Permission ID must be a positive integer")
    )
    .optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters").optional(),
  permissions: z
    .array(
      z.number().int().positive("Permission ID must be a positive integer")
    )
    .optional(),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
};
