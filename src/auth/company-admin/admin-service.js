// src/services/companyAdminService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/passwordUtils");
const { validateEmail, validatePassword } = require("../utils/validationUtils");

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

  const existingAdmin = await prisma.companyAdmin.findUnique({
    where: { email: data.email },
  });

  if (existingAdmin) {
    throw new AppError("Admin with this email already exists", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const existingCompanyAdmin = await prisma.companyAdmin.findUnique({
    where: { companyId: data.companyId },
  });

  if (existingCompanyAdmin) {
    throw new AppError("This company already has an admin", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.companyAdmin.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      companyId: data.companyId,
    },
  });
}

async function login(email, password) {
  const admin = await prisma.companyAdmin.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!admin) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!admin.company.isApproved) {
    throw new AppError("Company is not approved yet", 403);
  }

  const isPasswordValid = await comparePassword(password, admin.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({
    id: admin.id,
    companyId: admin.companyId,
    role: "companyAdmin",
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      companyId: admin.companyId,
    },
  };
}

async function getById(id) {
  const admin = await prisma.companyAdmin.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  return admin;
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

  return prisma.companyAdmin.update({
    where: { id },
    data,
  });
}

module.exports = {
  create,
  login,
  getById,
  update,
};
