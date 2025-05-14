const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const { login, getUserProfile } = require("./generic-auth");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// LOGIN CONTROLLER
exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const result = await login(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// GET PROFILE CONTROLLER
// GET PROFILE CONTROLLER (simplified)
exports.getProfile = async (req, res) => {
  console.log("&&&&&&&&&&&&&&profile");
  //getting profile
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const profile = await getUserProfile(userId);

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || "Invalid or expired token",
    });
  }
};
