const { PrismaClient } = require("@prisma/client");
const { comparePassword, generateToken } = require("../utils/passwordUtils");
const { AppError } = require("../utils/errorUtils");

const prisma = new PrismaClient();

const login = async (email, password) => {
  try {
    // 1. Check SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });
    if (superAdmin) {
      const isValid = await comparePassword(password, superAdmin.password);
      if (!isValid) throw new AppError("Invalid credentials", 401);

      return {
        token: generateToken({
          id: superAdmin.id,
          role: "super_admin",
        }),
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: "super_admin",
        },
      };
    }

    // 2. Check Regular Users (including Company Admins)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        company: true,
      },
    });

    if (!user) throw new AppError("Invalid credentials", 401);

    // 3. Validate Password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new AppError("Invalid credentials", 401);

    // 4. Extract Permissions from Database
    const permissions = user.role.permissions.map((rp) => rp.permission.name);

    // 5. Generate Token
    const tokenPayload = {
      id: user.id,
      role: user.role.name,
      companyId: user.companyId,
      permissions,
    };

    // 6. Prepare Response
    const responseData = {
      token: generateToken(tokenPayload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        companyId: user.companyId,
        companyName: user.company?.name,
        permissions,
      },
    };

    // 7. Special Handling for Company Admins (if needed)
    if (user.role.name === "company_admin") {
      // Add any additional company_admin specific properties
      responseData.user.companyDetails = {
        id: user.companyId,
        name: user.company?.name,
      };
    }

    return responseData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const getUserProfile = async (id) => {
  try {
    // 1. Check SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { id },
    });

    if (superAdmin) {
      return {
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          name: superAdmin.name,
          role: "super_admin",
        },
      };
    }

    // 2. Check Regular Users (including Company Admins)
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        company: true, // Include full company object
      },
    });

    if (!user) throw new AppError("User not found", 404);

    // 3. Extract Permissions
    const permissions = user.role.permissions.map((rp) => rp.permission.name);

    // 4. Prepare Response
    const profile = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        companyId: user.companyId,
        permissions,
        company: user.company
          ? {
              id: user.company.id,
              name: user.company.name,
              address: user.company.address, // if exists
              email: user.company.email, // if exists
              phone: user.company.phone, // if exists
              // Add any other fields you have in the company model
            }
          : null,
      },
    };

    return profile;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

module.exports = { login, getUserProfile };
