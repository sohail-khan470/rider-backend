// src/services/staffService.js
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

  const existingStaff = await prisma.staff.findUnique({
    where: { email: data.email },
  });

  if (existingStaff) {
    throw new AppError("Staff with this email already exists", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const role = await prisma.staffRole.findUnique({
    where: { id: data.roleId },
  });

  if (!role) {
    throw new AppError("Staff role not found", 404);
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.staff.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      roleId: data.roleId,
      companyId: data.companyId,
    },
    include: {
      role: true,
    },
  });
}

async function login(email, password) {
  const staff = await prisma.staff.findUnique({
    where: { email },
    include: {
      role: true,
      company: true,
    },
  });

  if (!staff) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!staff.company.isApproved) {
    throw new AppError("Company is not approved yet", 403);
  }

  const isPasswordValid = await comparePassword(password, staff.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({
    id: staff.id,
    companyId: staff.companyId,
    roleId: staff.roleId,
    role: "staff",
  });

  return {
    token,
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      companyId: staff.companyId,
    },
  };
}

async function getById(id) {
  const staff = await prisma.staff.findUnique({
    where: { id: Number(id) },
    include: {
      role: true,
      company: true,
    },
  });

  if (!staff) {
    throw new AppError("Staff not found", 404);
  }

  return staff;
}

async function list(companyId) {
  return prisma.staff.findMany({
    where: { companyId },
    include: {
      role: true,
    },
  });
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

  if (data.roleId) {
    const role = await prisma.staffRole.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      throw new AppError("Staff role not found", 404);
    }
  }

  return prisma.staff.update({
    where: { id },
    data,
    include: {
      role: true,
    },
  });
}

async function deleteStaff(id) {
  // Renamed safely
  return prisma.staff.delete({
    where: { id },
  });
}

module.exports = {
  create,
  login,
  getById,
  list,
  update,
  deleteStaff,
};
