// src/services/bookingService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const { locationService } = require("../location");
const prisma = new PrismaClient();

async function create(data) {
  console.log("*********servuce");
  const customer = await prisma.customer.findUnique({
    where: { id: Number(data.customerId) },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const company = await prisma.company.findUnique({
    where: { id: Number(data.companyId) },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if (data.driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: Number(data.driverId) },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    if (driver.status !== "online") {
      throw new AppError("Driver is not available", 400);
    }

    if (driver.companyId !== data.companyId) {
      throw new AppError("Driver does not belong to this company", 400);
    }
  }

  return prisma.booking.create({
    data: {
      customerId: data.customerId,
      driverId: data.driverId,
      companyId: data.companyId,
      pickup: data.pickup,
      dropoff: data.dropoff,
      fare: data.fare,
      status: data.driverId ? "accepted" : "pending",
    },
    include: {
      customer: true,
      driver: true,
    },
  });
}

async function getById(id) {
  console.log("getById**********", id);
  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) },
    include: {
      customer: true,
      driver: {
        include: {
          location: true,
        },
      },
      company: true,
    },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
}

async function list(companyId, filters = {}) {
  const where = { companyId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  if (filters.startDate && filters.endDate) {
    where.requestedAt = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  return prisma.booking.findMany({
    where,
    include: {
      customer: true,
      driver: true,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });
}

async function assignDriver(bookingId, driverId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "pending") {
    throw new AppError("Booking is not in pending status", 400);
  }

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  if (driver.status !== "online") {
    throw new AppError("Driver is not available", 400);
  }

  if (driver.companyId !== booking.companyId) {
    throw new AppError("Driver does not belong to this company", 400);
  }

  return prisma
    .$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          driverId,
          status: "accepted",
        },
        include: {
          customer: true,
          driver: true,
        },
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: { status: "on_trip" },
      }),
    ])
    .then((results) => results[0]);
}

async function updateStatus(bookingId, status) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { driver: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const validTransitions = {
    pending: ["accepted", "cancelled"],
    accepted: ["ongoing", "cancelled"],
    ongoing: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status].includes(status)) {
    throw new AppError(
      `Cannot change status from ${booking.status} to ${status}`,
      400
    );
  }

  let driverStatus = booking.driver?.status;

  if (booking.driverId) {
    if (status === "ongoing") {
      driverStatus = "on_trip";
    } else if (status === "completed" || status === "cancelled") {
      driverStatus = "online";
    }
  }

  return prisma
    .$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: {
          customer: true,
          driver: true,
        },
      }),
      ...(booking.driverId && driverStatus
        ? [
            prisma.driver.update({
              where: { id: booking.driverId },
              data: { status: driverStatus },
            }),
          ]
        : []),
    ])
    .then((results) => results[0]);
}

async function findNearbyDriversForBooking(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "pending") {
    throw new AppError("Booking is not in pending status", 400);
  }

  const coordinates = parseCoordinates(booking.pickup);

  return locationService.getNearbyDrivers(
    booking.companyId,
    coordinates.lat,
    coordinates.lng
  );
}

function parseCoordinates(locationString) {
  try {
    const [lat, lng] = locationString
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    return { lat, lng };
  } catch (error) {
    return { lat: 0, lng: 0 };
  }
}

module.exports = {
  create,
  getById,
  list,
  assignDriver,
  updateStatus,
  findNearbyDriversForBooking,
};
