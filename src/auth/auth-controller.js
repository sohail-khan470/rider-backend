const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const {
  login,
  signup,
  getUserProfile,
  registerSuperAdmin,
} = require("./auth-service");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const prisma = new PrismaClient();

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Email and password are required" });
    }

    const result = await login(email, password);

    if (!result.success) {
      return res.status(result.statusCode || StatusCodes.BAD_REQUEST).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: result.data,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};

// SIGNUP CONTROLLER
exports.signup = async (req, res) => {
  try {
    const { name, email, password, roleId, companyId } = req.body;

    // Basic validation
    if (!name || !email || !password || !roleId || !companyId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "All fields are required: name, email, password, roleId, companyId",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate roleId and companyId are numbers
    if (isNaN(roleId) || isNaN(companyId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "RoleId and CompanyId must be valid numbers",
      });
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      roleId: parseInt(roleId),
      companyId: parseInt(companyId),
    };

    const result = await signup(userData);

    if (!result.success) {
      return res.status(result.statusCode || StatusCodes.BAD_REQUEST).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message: error.message || "Internal server error",
      });
  }
};

exports.getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Authorization token missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const result = await getUserProfile(userId);

    if (!result.success) {
      return res.status(result.statusCode || StatusCodes.NOT_FOUND).json({
        success: false,
        message: result.error,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User profile fetched successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    console.error("Get companies error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.registerSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await registerSuperAdmin(email, password);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Super Admin registered successfully",
      data: admin,
    });
  } catch (error) {}
};
