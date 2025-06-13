const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

class UserService {
  async create(data) {
    try {
      // Check if user with email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Check if role exists and belongs to the company
      const role = await prisma.role.findUnique({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...data,
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
      throw error;
    }
  }

  async findAll(filters = {}) {
    const users = await prisma.user.findMany({
      where: filters,
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

    return users;
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
      const currentUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!currentUser) {
        throw new Error("User not found");
      }

      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: Number(id) },
          },
        });

        if (existingUser) {
          throw new Error("Email is already taken by another user");
        }
      }

      if (data.roleId) {
        const role = await prisma.role.findUnique({
          where: { id: data.roleId },
        });

        if (!role) {
          throw new Error("Role not found");
        }

        if (role.companyId !== currentUser.companyId) {
          throw new Error("Role does not belong to this company");
        }
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const user = await prisma.user.update({
        where: { id: Number(id) },
        data,
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

    const permissions = user.role.permissions.map((p) => p.permission.name);

    const { password: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      permissions,
    };
  }

  async getAdmins(companyId) {
    const parsedId = Number(companyId);
    if (!companyId || isNaN(parsedId)) {
      throw new Error("Invalid company ID");
    }

    try {
      // First find the ADMIN role for this company
      const adminRole = await prisma.role.findFirst({
        where: {
          name: "ADMIN",
          users: {
            some: {
              companyId: parsedId,
            },
          },
        },
        select: { id: true },
      });

      if (!adminRole) return [];

      // Then find users with this role and company
      return await prisma.user.findMany({
        where: {
          roleId: adminRole.id,
          companyId: parsedId,
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
    } catch (error) {
      console.error("[getAdmins Error]", error);
      throw new Error("Failed to fetch admin users");
    }
  }
}

module.exports = new UserService();
