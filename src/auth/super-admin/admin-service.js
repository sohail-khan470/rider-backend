const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
const createSuperAdminSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateSuperAdminSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

class SuperAdminService {
  async create(data) {
    try {
      // Validate input data
      const validatedData = createSuperAdminSchema.parse(data);

      // Check if super admin with email already exists
      const existingSuperAdmin = await prisma.superAdmin.findUnique({
        where: { email: validatedData.email },
      });

      if (existingSuperAdmin) {
        throw new Error("Super admin with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create super admin
      const superAdmin = await prisma.superAdmin.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
        },
      });

      // Remove password from response
      const { password, ...superAdminWithoutPassword } = superAdmin;
      return superAdminWithoutPassword;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async findAll() {
    const superAdmins = await prisma.superAdmin.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return superAdmins;
  }

  async findById(id) {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!superAdmin) {
      throw new Error("Super admin not found");
    }

    return superAdmin;
  }

  async update(id, data) {
    try {
      // Validate input data
      const validatedData = updateSuperAdminSchema.parse(data);

      // If updating email, check if it's already taken
      if (validatedData.email) {
        const existingSuperAdmin = await prisma.superAdmin.findFirst({
          where: {
            email: validatedData.email,
            id: { not: Number(id) },
          },
        });

        if (existingSuperAdmin) {
          throw new Error("Email is already taken by another super admin");
        }
      }

      // If updating password, hash it
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      // Update super admin
      const superAdmin = await prisma.superAdmin.update({
        where: { id: Number(id) },
        data: validatedData,
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return superAdmin;
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
      await prisma.superAdmin.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Super admin deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete super admin: ${error.message}`);
    }
  }

  async authenticate(email, password) {
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, superAdmin.password);

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    // Remove password from response
    const { password: _, ...superAdminWithoutPassword } = superAdmin;
    return superAdminWithoutPassword;
  }

  async getDashboardStats() {
    const [
      totalCompanies,
      pendingCompanies,
      totalDrivers,
      totalCustomers,
      totalBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isApproved: false } }),
      prisma.driver.count(),
      prisma.customer.count(),
      prisma.booking.count(),
      prisma.booking.findMany({
        orderBy: {
          requestedAt: "desc",
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      totalCompanies,
      pendingCompanies,
      totalDrivers,
      totalCustomers,
      totalBookings,
      recentBookings,
    };
  }
}

module.exports = new SuperAdminService();
