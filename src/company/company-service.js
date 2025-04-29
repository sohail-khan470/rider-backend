// src/services/companyService.js
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

  const existingCompany = await prisma.company.findUnique({
    where: { email: data.email },
  });

  if (existingCompany) {
    throw new AppError("Company with this email already exists", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.company.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      timezone: data.timezone || "UTC",
    },
  });
}

async function login(email, password) {
  const company = await prisma.company.findUnique({
    where: { email },
  });

  if (!company) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!company.isApproved) {
    throw new AppError("Company account is pending approval", 403);
  }

  const isPasswordValid = await comparePassword(password, company.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({ id: company.id, role: "company" });

  return {
    token,
    company: { id: company.id, name: company.name, email: company.email },
  };
}

async function getById(id) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      admin: true,
      drivers: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
        },
      },
      staff: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      customers: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return company;
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

  return prisma.company.update({
    where: { id },
    data,
  });
}

async function list(filters = {}) {
  const where = {};
  if (filters.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }

  return prisma.company.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      isApproved: true,
      createdAt: true,
      timezone: true,
    },
  });
}

async function approveCompany(id) {
  return prisma.company.update({
    where: { id },
    data: { isApproved: true },
  });
}

async function deleteCompany(id) {
  return prisma.company.delete({
    where: { id },
  });
}

module.exports = {
  create,
  login,
  getById,
  update,
  list,
  approveCompany,
  delete: deleteCompany,
};
