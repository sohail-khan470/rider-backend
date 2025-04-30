// src/services/driverService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const { validateEmail, validatePhone } = require("../utils/validationUtils");

const prisma = new PrismaClient();

async function listAll() {
  return prisma.driver.findMany();
}

async function create(data) {
  if (!validateEmail(data.email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (!validatePhone(data.phone)) {
    throw new AppError("Invalid phone format", 400);
  }

  const existingDriver = await prisma.driver.findUnique({
    where: { email: data.email },
  });

  if (existingDriver) {
    throw new AppError("Driver with this email already exists", 400);
  }

  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return prisma.driver.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      vehicleInfo: data.vehicleInfo,
      companyId: data.companyId,
    },
  });
}

async function getById(id) {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      location: true,
      availability: true,
    },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  return driver;
}

async function list(companyId, filters = {}) {
  const where = { companyId };

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.driver.findMany({
    where,
    include: {
      location: true,
      availability: true,
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

  return prisma.driver.update({
    where: { id },
    data,
  });
}

async function updateStatus(id, status) {
  return prisma.driver.update({
    where: { id: Number(id) },
    data: { status },
  });
}

async function deleteDriver(id) {
  const activeBookings = await prisma.booking.count({
    where: {
      driverId: id,
      status: {
        in: ["accepted", "ongoing"],
      },
    },
  });

  if (activeBookings > 0) {
    throw new AppError("Cannot delete driver with active bookings", 400);
  }

  return prisma.driver.delete({
    where: { id },
  });
}

async function addAvailability(driverId, startTime, endTime) {
  if (new Date(startTime) >= new Date(endTime)) {
    throw new AppError("Start time must be before end time", 400);
  }

  return prisma.driverAvailability.create({
    data: {
      driverId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });
}

async function removeAvailability(id) {
  return prisma.driverAvailability.delete({
    where: { id },
  });
}

async function findAvailableDrivers(companyId, requestTime) {
  const time = new Date(requestTime);

  return prisma.driver.findMany({
    where: {
      companyId,
      status: "online",
      availability: {
        some: {
          startTime: { lte: time },
          endTime: { gte: time },
        },
      },
    },
    include: {
      location: true,
    },
  });
}

module.exports = {
  create,
  getById,
  list,
  update,
  updateStatus,
  delete: deleteDriver,
  addAvailability,
  removeAvailability,
  findAvailableDrivers,
  listAll,
};
