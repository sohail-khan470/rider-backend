// src/services/superAdminService.js
const { PrismaClient } = require("@prisma/client");
// const {
//   hashPassword,
//   comparePassword,
//   generateToken,
// } = require("../../utils/passwordUtils");

const { AppError } = require("../../utils/errorUtils");
const {
  validateEmail,
  validatePhone,
  validatePassword,
} = require("../../utils/validationUtils");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../../utils/passwordUtils");

const prisma = new PrismaClient();

async function create(data) {
  if (!validateEmail(data.email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!validatePassword(data.password)) {
    throw new AppError(
      "Password must be at least 8 characters with at least one letter and one number",
      400
    );
  }

  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: { email: data.email },
  });

  if (existingSuperAdmin) {
    throw new AppError("Super admin with this email already exists", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.superAdmin.create({
    data: {
      email: data.email,
      password: hashedPassword,
    },
  });
}

async function login(email, password) {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { email },
  });

  if (!superAdmin) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await comparePassword(password, superAdmin.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({ id: superAdmin.id, role: "superAdmin" });

  return {
    token,
    superAdmin: { id: superAdmin.id, email: superAdmin.email },
  };
}

async function getById(id) {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: { id: Number(id) },
  });

  if (!superAdmin) {
    throw new AppError("Super admin not found", 404);
  }

  return superAdmin;
}

async function update(id, data) {
  if (data.email && !validateEmail(data.email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (data.password) {
    if (!validatePassword(data.password)) {
      throw new AppError(
        "Password must be at least 8 characters with at least one letter and one number",
        400
      );
    }
    data.password = await hashPassword(data.password);
  }

  return prisma.superAdmin.update({
    where: { id: Number(id) },
    data,
  });
}

module.exports = {
  create,
  login,
  getById,
  update,
};
