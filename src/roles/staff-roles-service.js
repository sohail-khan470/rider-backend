// src/services/staffRoleService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");

const prisma = new PrismaClient();

async function create(data) {
  const existingRole = await prisma.staffRole.findUnique({
    where: { name: data.name },
  });

  if (existingRole) {
    throw new AppError("Staff role with this name already exists", 400);
  }

  return prisma.staffRole.create({
    data: {
      name: data.name,
    },
  });
}

async function getById(id) {
  const role = await prisma.staffRole.findUnique({
    where: { id },
    include: {
      staff: true,
    },
  });

  if (!role) {
    throw new AppError("Staff role not found", 404);
  }

  return role;
}

async function update(id, data) {
  if (data.name) {
    const existingRole = await prisma.staffRole.findUnique({
      where: { name: data.name },
    });

    if (existingRole && existingRole.id !== id) {
      throw new AppError("Staff role with this name already exists", 400);
    }
  }

  return prisma.staffRole.update({
    where: { id },
    data,
  });
}

async function list() {
  return prisma.staffRole.findMany({
    include: {
      _count: {
        select: { staff: true },
      },
    },
  });
}

async function deleteRole(id) {
  // renamed to avoid conflict with reserved `delete`
  const staffUsingRole = await prisma.staff.count({
    where: { roleId: id },
  });

  if (staffUsingRole > 0) {
    throw new AppError(
      "Cannot delete role as it is assigned to staff members",
      400
    );
  }

  return prisma.staffRole.delete({
    where: { id },
  });
}

module.exports = {
  create,
  getById,
  update,
  list,
  deleteRole,
};
