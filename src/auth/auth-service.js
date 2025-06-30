const { PrismaClient } = require("@prisma/client");
const {
  comparePassword,
  generateToken,
  hashPassword,
} = require("../utils/passwordUtils");
const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../utils/errorUtils");

const prisma = new PrismaClient();

const login = async (email, password) => {
  try {
    // 1. Check SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });

    if (superAdmin) {
      const isValid = await comparePassword(password, superAdmin.password);
      if (!isValid) {
        throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
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

    // 2. Check Regular Users (including Company Admins) with all related data
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
        company: {
          include: {
            contact: true,
            addresses: true,
            media: true,
            profile: true,
          },
        },
        notifications: {
          where: {
            isRead: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
    }

    // 3. Validate Password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED);
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
        unreadNotifications: user.notifications,
        companyDetails: {
          ...user.company,
          contact: user.company?.contact,
          addresses: user.company?.addresses,
          media: user.company?.media,
          profile: user.company?.profile,
        },
      },
    };

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.log(error);
    throw new AppError("Login error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const signup = async (userData) => {
  try {
    const { name, email, password, roleId, companyId } = userData;

    // 1. Validate required fields
    if (!name || !email || !password || !roleId || !companyId) {
      return {
        success: false,
        error:
          "All fields (name, email, password, roleId, companyId) are required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        StatusCodes.CONFLICT
      );
    }

    // 3. Validate role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new AppError("Invalid role specified", StatusCodes.BAD_REQUEST);
    }

    // 4. Validate company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new AppError("Invalid company specified", StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        companyId,
      },
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

    // 7. Extract permissions
    const permissions = newUser.role.permissions.map(
      (rp) => rp.permission.name
    );

    // 8. Generate token
    const tokenPayload = {
      id: newUser.id,
      role: newUser.role.name,
      companyId: newUser.companyId,
      permissions,
    };

    // 9. Prepare response data
    const responseData = {
      token: generateToken(tokenPayload),
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role.name,
        companyId: newUser.companyId,
        companyName: newUser.company?.name,
        permissions,
        createdAt: newUser.createdAt,
      },
    };

    // 10. Special handling for company admins
    if (newUser.role.name === "company_admin") {
      responseData.user.companyDetails = {
        id: newUser.companyId,
        name: newUser.company?.name,
      };
    }

    try {
      await prisma.notification.create({
        data: {
          type: "NEW_USER_REGISTERED",
          title: "New User Registered",
          message: `${newUser.name} has registered with email ${newUser.email}`,
          companyId: newUser.companyId,
        },
      });
    } catch (notificationError) {
      console.warn("Failed to create notification:", notificationError);
    }

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
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
        statusCode: StatusCodes.NOT_FOUND,
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
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    };
  }
};

const registerSuperAdmin = async (email, password) => {
  console.log(email, password);
  try {
    const hashedPassword = await hashPassword(password);
    const superAdmin = await prisma.superAdmin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    return superAdmin;
  } catch (error) {
    console.error("Register Super Admin error:", error);
    throw new AppError(
      "Registration failed",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = { login, signup, getUserProfile, registerSuperAdmin };
