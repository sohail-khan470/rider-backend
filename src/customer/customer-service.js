// src/services/customerService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const { validateEmail, validatePhone } = require("../utils/validationUtils");

const prisma = new PrismaClient();

async function create(data) {
  if (!validateEmail(data.email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!validatePhone(data.phone)) {
    throw new AppError("Invalid phone format", 400);
  }

  const existingCustomer = await prisma.customer.findUnique({
    where: { email: data.email },
  });

  if (existingCustomer) {
    throw new AppError("Customer with this email already exists", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyId: data.companyId,
    },
  });
}

async function getById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: {
          requestedAt: "desc",
        },
        include: {
          driver: true,
        },
      },
    },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
}

async function list(companyId, searchQuery = "") {
  const where = { companyId };

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { email: { contains: searchQuery } },
      { phone: { contains: searchQuery } },
    ];
  }

  return prisma.customer.findMany({
    where,
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });
}

async function update(id, data) {
  if (data.email && !validateEmail(data.email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (data.phone && !validatePhone(data.phone)) {
    throw new AppError("Invalid phone format", 400);
  }

  return prisma.customer.update({
    where: { id },
    data,
  });
}

async function deleteCustomer(id) {
  const activeBookings = await prisma.booking.count({
    where: {
      customerId: id,
      status: {
        in: ["pending", "accepted", "ongoing"],
      },
    },
  });

  if (activeBookings > 0) {
    throw new AppError("Cannot delete customer with active bookings", 400);
  }

  return prisma.customer.delete({
    where: { id },
  });
}

module.exports = {
  create,
  getById,
  list,
  update,
  delete: deleteCustomer,
};
