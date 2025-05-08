const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const { login } = require("./generic-auth");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

exports.loginController = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const result = await login(email, password);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

exports.getProfile = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.role;
    const id = decoded.id;

    if (role === "superAdmin") {
      const admin = await prisma.superAdmin.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return res.status(200).json({
        admin,
        role,
      });
    } else if (role === "companyAdmin") {
      const admin = await prisma.companyAdmin.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          company: {
            select: {
              id: true,
              name: true,
              isApproved: true,
            },
          },
        },
      });
      return res.status(200).json({
        admin,
        role,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
