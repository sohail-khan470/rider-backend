const { PrismaClient } = require("@prisma/client");
const { comparePassword, generateToken } = require("../utils/passwordUtils");

const prisma = new PrismaClient();

const login = async (email, password) => {
  try {
    // 1. Check SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });

    if (superAdmin) {
      const isValid = await comparePassword(password, superAdmin.password);
      if (!isValid) {
        return {
          success: false,
          error: "Invalid credentials",
          statusCode: 401,
        };
      }

      return {
        success: true,
        data: {
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

    if (!user) {
      return {
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      };
    }

    // 3. Validate Password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid credentials",
        statusCode: 401,
      };
    }

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

    // 7. Special Handling for Company Admins
    if (user.role.name === "company_admin") {
      responseData.user.companyDetails = {
        id: user.companyId,
        name: user.company?.name,
      };
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
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
        success: true,
        data: {
          user: {
            id: superAdmin.id,
            email: superAdmin.email,
            name: superAdmin.name,
            role: "super_admin",
          },
        },
      };
    }

    // 2. Check Regular Users
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
        company: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

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
              address: user.company.address,
              email: user.company.email,
              phone: user.company.phone,
            }
          : null,
      },
    };

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

module.exports = { login, getUserProfile };
