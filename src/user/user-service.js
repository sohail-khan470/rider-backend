const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(2, "User name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.number().int().positive("Role ID must be a positive integer"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "User name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  roleId: z
    .number()
    .int()
    .positive("Role ID must be a positive integer")
    .optional(),
});

class UserService {
  async create(data) {
    try {
      // Validate input data
      const validatedData = createUserSchema.parse(data);

      // Check if user with email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Check if role exists and belongs to the company
      const role = await prisma.role.findUnique({
        where: { id: validatedData.roleId },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      if (role.companyId !== validatedData.companyId) {
        throw new Error("Role does not belong to this company");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
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
    const users = await prisma.user.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.user.count({ where: filters });

    return {
      data: users,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }

  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async update(id, data) {
    try {
      // Validate input data
      const validatedData = updateUserSchema.parse(data);

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      // If updating email, check if it's already taken
      if (validatedData.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: Number(id) },
          },
        });

        if (existingUser) {
          throw new Error("Email is already taken by another user");
        }
      }

      // If updating role, check if it exists and belongs to the same company
      if (validatedData.roleId) {
        const role = await prisma.role.findUnique({
          where: { id: validatedData.roleId },
        });

        if (!role) {
          throw new Error("Role not found");
        }

        if (role.companyId !== currentUser.companyId) {
          throw new Error("Role does not belong to this company");
        }
      }

      // Hash password if provided
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: validatedData,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      return user;
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
      await prisma.user.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async authenticate(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            isApproved: true,
          },
        },
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    if (!user.company.isApproved) {
      throw new Error("Your company account has not been approved yet");
    }

    // Extract permissions
    const permissions = user.role.permissions.map((p) => p.permission.name);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      permissions,
    };
  }

  async getAdmins(companyId) {
    try {
      // Find the Admin role first
      const adminRole = await prisma.role.findFirst({
        where: {
          name: "Admin",
          companyId: Number(companyId),
        },
      });

      if (!adminRole) {
        return [];
      }

      // Find all users with the Admin role
      const adminUsers = await prisma.user.findMany({
        where: {
          roleId: adminRole.id,
          companyId: Number(companyId),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return adminUsers;
    } catch (error) {
      throw new Error(`Failed to get admin users: ${error.message}`);
    }
  }
}

module.exports = new UserService();
