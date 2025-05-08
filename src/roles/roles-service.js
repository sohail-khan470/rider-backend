const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
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

class RoleService {
  async create(data) {
    try {
      // Validate input data
      const validatedData = createRoleSchema.parse(data);

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Check if role with same name already exists for this company
      const existingRole = await prisma.role.findFirst({
        where: {
          name: validatedData.name,
          companyId: validatedData.companyId,
        },
      });

      if (existingRole) {
        throw new Error("Role with this name already exists for this company");
      }

      // Start transaction
      const role = await prisma.$transaction(async (prismaClient) => {
        // Create role
        const newRole = await prismaClient.role.create({
          data: {
            name: validatedData.name,
            companyId: validatedData.companyId,
          },
        });

        // Assign permissions if provided
        if (validatedData.permissions && validatedData.permissions.length > 0) {
          // Verify all permissions exist
          const permissionCount = await prismaClient.permission.count({
            where: {
              id: {
                in: validatedData.permissions,
              },
            },
          });

          if (permissionCount !== validatedData.permissions.length) {
            throw new Error("One or more permissions do not exist");
          }

          // Create role permissions
          await Promise.all(
            validatedData.permissions.map((permissionId) =>
              prismaClient.rolePermission.create({
                data: {
                  roleId: newRole.id,
                  permissionId,
                },
              })
            )
          );
        }

        // Return role with permissions
        return prismaClient.role.findUnique({
          where: { id: newRole.id },
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      });

      return role;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async findAll(filters = {}, pagination = { skip: 0, take: 10 }) {
    const roles = await prisma.role.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.role.count({ where: filters });

    return {
      data: roles,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }

  async findById(id) {
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  }

  async update(id, data) {
    try {
      // Validate input data
      const validatedData = updateRoleSchema.parse(data);

      // Get current role
      const currentRole = await prisma.role.findUnique({
        where: { id: Number(id) },
      });

      if (!currentRole) {
        throw new Error("Role not found");
      }

      // If updating name, check if it's already taken in the same company
      if (validatedData.name) {
        const existingRole = await prisma.role.findFirst({
          where: {
            name: validatedData.name,
            companyId: currentRole.companyId,
            id: { not: Number(id) },
          },
        });

        if (existingRole) {
          throw new Error(
            "Role with this name already exists for this company"
          );
        }
      }

      // Start transaction
      const role = await prisma.$transaction(async (prismaClient) => {
        // Update role name if provided
        if (validatedData.name) {
          await prismaClient.role.update({
            where: { id: Number(id) },
            data: { name: validatedData.name },
          });
        }

        // Update permissions if provided
        if (validatedData.permissions) {
          // Verify all permissions exist
          if (validatedData.permissions.length > 0) {
            const permissionCount = await prismaClient.permission.count({
              where: {
                id: {
                  in: validatedData.permissions,
                },
              },
            });

            if (permissionCount !== validatedData.permissions.length) {
              throw new Error("One or more permissions do not exist");
            }
          }

          // Delete existing role permissions
          await prismaClient.rolePermission.deleteMany({
            where: { roleId: Number(id) },
          });

          // Create new role permissions
          if (validatedData.permissions.length > 0) {
            await Promise.all(
              validatedData.permissions.map((permissionId) =>
                prismaClient.rolePermission.create({
                  data: {
                    roleId: Number(id),
                    permissionId,
                  },
                })
              )
            );
          }
        }

        // Return updated role with permissions
        return prismaClient.role.findUnique({
          where: { id: Number(id) },
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      return role;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      // Check if role has users
      const usersCount = await prisma.user.count({
        where: { roleId: Number(id) },
      });

      if (usersCount > 0) {
        throw new Error("Cannot delete role that is assigned to users");
      }

      // Delete role permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: Number(id) },
      });

      // Delete role
      await prisma.role.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Role deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  async getPermissions() {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return permissions;
  }

  async addPermissionToRole(roleId, permissionId) {
    try {
      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: Number(roleId) },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      // Check if permission exists
      const permission = await prisma.permission.findUnique({
        where: { id: Number(permissionId) },
      });

      if (!permission) {
        throw new Error("Permission not found");
      }

      // Check if role already has permission
      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: Number(roleId),
          permissionId: Number(permissionId),
        },
      });

      if (existingRolePermission) {
        throw new Error("Role already has this permission");
      }

      // Add permission to role
      await prisma.rolePermission.create({
        data: {
          roleId: Number(roleId),
          permissionId: Number(permissionId),
        },
      });

      return {
        success: true,
        message: "Permission added to role successfully",
      };
    } catch (error) {
      throw new Error(`Failed to add permission to role: ${error.message}`);
    }
  }

  async removePermissionFromRole(roleId, permissionId) {
    try {
      // Check if role exists
      const role = await prisma.role.findUnique({
        where: { id: Number(roleId) },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      // Check if permission exists
      const permission = await prisma.permission.findUnique({
        where: { id: Number(permissionId) },
      });

      if (!permission) {
        throw new Error("Permission not found");
      }

      // Remove permission from role
      await prisma.rolePermission.deleteMany({
        where: {
          roleId: Number(roleId),
          permissionId: Number(permissionId),
        },
      });

      return {
        success: true,
        message: "Permission removed from role successfully",
      };
    } catch (error) {
      throw new Error(
        `Failed to remove permission from role: ${error.message}`
      );
    }
  }
}

module.exports = new RoleService();
