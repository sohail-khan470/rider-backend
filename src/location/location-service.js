// src/services/locationService.js
const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../utils/errorUtils");
const { StatusCodes } = require("http-status-codes");

const prisma = new PrismaClient();

async function updateDriverLocation(driverId, lat, lng) {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: { location: true },
  });

  if (!driver) {
    throw new AppError("Driver not found", StatusCodes.NOT_FOUND);
  }

  if (driver.location) {
    return prisma.location.update({
      where: { driverId },
      data: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.location.create({
      data: {
        driverId,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    });
  }
}

async function getDriverLocation(driverId) {
  const location = await prisma.location.findUnique({
    where: { driverId },
  });

  if (!location) {
    throw new AppError(
      "Location not found for this driver",
      StatusCodes.NOT_FOUND
    );
  }

  return location;
}

async function searchLocation(searchTerm) {
  try {
    // First, search in your local database
    const localLocations = await prisma.location.findMany({
      where: {
        OR: [{ address: { contains: searchTerm } }],
      },
      take: 5, // Reduce local results to make room for Nominatim results
    });

    // Search using Nominatim API
    const nominatimResults = await searchWithNominatim(searchTerm);

    // Combine and deduplicate results
    const combinedResults = [
      ...localLocations.map(transformLocalLocation),
      ...nominatimResults,
    ];

    // Remove duplicates and limit results
    const uniqueResults = deduplicateLocations(combinedResults);
    return uniqueResults.slice(0, 10);
  } catch (error) {
    throw new AppError(
      "Error searching locations",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function searchWithNominatim(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=5&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "LocationService/1.0",
      },
    });

    if (!response.ok) {
      console.log(`Nominatim API error: ${response.status}`);
      return [];
    }

    const data = await response.json();

    return data.map((item) => ({
      id: `nominatim-${item.place_id}`,
      name: item.display_name,
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city:
        item.address?.city || item.address?.town || item.address?.village || "",
      state: item.address?.state || item.address?.province || "",
      country: item.address?.country || "",
    }));
  } catch (error) {
    console.error("Nominatim search failed:", error);
    return []; // Return empty array if Nominatim fails, don't break the whole search
  }
}

function transformLocalLocation(location) {
  return {
    id: location.id,
    name: location.address || `Location ${location.id}`,
    address: location.address,
    lat: location.lat,
    lng: location.lng,
    city: "",
    state: "",
    country: "",
  };
}

function deduplicateLocations(locations) {
  const seen = new Set();
  return locations.filter((location) => {
    // Create a simple key for deduplication based on coordinates
    const key = `${location.lat?.toFixed(4)}-${location.lng?.toFixed(4)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function getAllLocations() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Transform to SearchedLocation format
    return locations.map((location) => ({
      id: location.id,
      name: location.address || `${location.city}, ${location.state}`,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      city: location.city,
      state: location.state,
      country: location.country,
    }));
  } catch (error) {
    throw new AppError(
      "Error fetching locations",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getLocationById(id) {
  const location = await prisma.location.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError("Location not found", StatusCodes.NOT_FOUND);
  }

  return location;
}

async function createLocation(data) {
  try {
    const location = await prisma.location.create({
      data: {
        ...data,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
      },
    });

    return location;
  } catch (error) {
    throw new AppError(
      "Error creating location",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function updateLocation(id, data) {
  try {
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new AppError("Location not found", StatusCodes.NOT_FOUND);
    }

    const updateData = { ...data };
    if (data.lat) updateData.lat = parseFloat(data.lat);
    if (data.lng) updateData.lng = parseFloat(data.lng);

    const location = await prisma.location.update({
      where: { id },
      data: updateData,
    });

    return location;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Error updating location",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function deleteLocation(id) {
  try {
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new AppError("Location not found", StatusCodes.NOT_FOUND);
    }

    await prisma.location.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Error deleting location",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
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
  searchLocation,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyDrivers,
};
