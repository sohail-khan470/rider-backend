const { PrismaClient } = require("@prisma/client");
const { comparePassword, generateToken } = require("../utils/passwordUtils");
const { AppError } = require("../utils/errorUtils");
const prisma = new PrismaClient();

const login = async (email, password) => {
  try {
    // Check for SuperAdmin first
    let user = await prisma.superAdmin.findUnique({
      where: { email },
    });

    let userType = "super_admin";
    let companyId = null;
    let role = null;
    let permissions = [];

    if (!user) {
      // If no SuperAdmin found, check Company
      user = await prisma.company.findUnique({
        where: { email },
      });
      userType = "company_admin";
      companyId = user?.id || null;
    }

    if (!user) {
      // If no Company found, check User
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
          company: true,
        },
      });
      userType = "user";

      if (user) {
        companyId = user.companyId;
        role = user.role.name;
        permissions = user.role.permissions.map((rp) => rp.permission.name);
      }
    }

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const tokenPayload = {
      id: user.id,
      type: userType,
      companyId,
      ...(role && { role }),
      ...(permissions.length > 0 && { permissions }),
    };

    const token = generateToken(tokenPayload);

    // Prepare response based on user type
    let responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        type: userType,
        ...(userType === "user" && {
          name: user.name,
          role: user.role.name,
          companyId: user.companyId,
          companyName: user.company.name,
          permissions,
        }),
        ...(userType === "company_admin" && {
          name: user.name,
        }),
      },
    };

    return responseData;
  } catch (error) {
    throw error; // Re-throw the error for the controller to handle
  }
};

module.exports = {
  login,
};
