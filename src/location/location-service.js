// src/services/locationService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");

const prisma = new PrismaClient();

async function updateDriverLocation(driverId, lat, lng) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { location: true },
  });

  if (!driver) {
    throw new AppError("Driver not found", 404);
  }

  if (driver.location) {
    return prisma.location.update({
      where: { driverId },
      data: { lat, lng },
    });
  } else {
    return prisma.location.create({
      data: {
        driverId,
        lat,
        lng,
      },
    });
  }
}

async function getDriverLocation(driverId) {
  const location = await prisma.location.findUnique({
    where: { driverId },
  });

  if (!location) {
    throw new AppError("Location not found for this driver", 404);
  }

  return location;
}

async function getNearbyDrivers(companyId, lat, lng, radiusInKm = 5) {
  const drivers = await prisma.driver.findMany({
    where: {
      companyId,
      status: "online",
      location: {
        isNot: null,
      },
    },
    include: {
      location: true,
    },
  });

  // Calculate distances and filter by radius
  const nearbyDrivers = drivers.filter((driver) => {
    if (!driver.location) return false;

    const distance = calculateDistance(
      lat,
      lng,
      driver.location.lat,
      driver.location.lng
    );

    // Add distance to driver object
    driver.distance = distance;

    return distance <= radiusInKm;
  });

  // Sort by distance
  return nearbyDrivers.sort((a, b) => a.distance - b.distance);
}

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  getNearbyDrivers,
};
