const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class DriverService {
  async create(data) {
    try {
      // Check if driver with email already exists
      const existingDriver = await prisma.driver.findUnique({
        where: { email: data.email },
      });

      if (existingDriver) {
        throw new Error("Driver with this email already exists");
      }

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Check if city exists
      const city = await prisma.city.findUnique({
        where: { id: data.cityId },
      });

      if (!city) {
        throw new Error("City not found");
      }

      // Create driver
      const driver = await prisma.driver.create({
        data: {
          ...data,
          status: data.status || "offline",
          timezone: data.timezone || company.timezone,
        },
      });

      return driver;
    } catch (error) {
      throw error;
    }
  }

  // async findAll(filters = {}, companyId) {
  //   console.log(companyId);
  //   console.log("Finding all drivers");

  //   try {
  //     // Execute both queries in parallel
  //     const [drivers, total] = await Promise.all([
  //       prisma.driver.findMany({
  //         where: filters,
  //         include: {
  //           company: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //           city: {
  //             select: {
  //               id: true,
  //               name: true,
  //             },
  //           },
  //           location: true,
  //           _count: {
  //             select: {
  //               bookings: true,
  //             },
  //           },
  //         },
  //       }),
  //       prisma.driver.count({
  //         where: filters,
  //       }),
  //     ]);

  //     return {
  //       data: drivers,
  //     };
  //   } catch (error) {
  //     console.error("Error in DriverService.findAll:", error);
  //     throw new Error("Failed to retrieve drivers: " + error.message);
  //   }
  // }
  async findAll(filters = {}, companyId) {
    try {
      // Merge companyId into filters
      const whereClause = {
        ...filters,
        companyId: Number(companyId), // this ensures only drivers of the given company are fetched
      };

      // Execute both queries in parallel
      const [drivers, total] = await Promise.all([
        prisma.driver.findMany({
          where: whereClause,
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            city: {
              select: {
                id: true,
                name: true,
              },
            },
            location: true,
            _count: {
              select: {
                bookings: true,
              },
            },
          },
        }),
        prisma.driver.count({
          where: whereClause,
        }),
      ]);

      return {
        data: drivers,
        total,
      };
    } catch (error) {
      console.error("Error in DriverService.findAll:", error);
      throw new Error("Failed to retrieve drivers: " + error.message);
    }
  }

  async findById(id) {
    const driver = await prisma.driver.findUnique({
      where: { id: Number(id) },
      select: {
        name: true,
        email: true,
        phone: true,
        status: true,
        vehicleInfo: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            lat: true,
            lng: true,
          },
        },
        bookings: {
          orderBy: { requestedAt: "desc" },
        },
        availability: {
          orderBy: { startTime: "asc" },
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!driver) {
      throw new Error("Driver not found");
    }

    return driver;
  }

  async update(id, data) {
    try {
      // If updating email, check if it's already taken
      if (data.email) {
        const existingDriver = await prisma.driver.findFirst({
          where: {
            email: data.email,
            id: { not: Number(id) },
          },
        });

        if (existingDriver) {
          throw new Error("Email is already taken by another driver");
        }
      }

      // If updating company, check if it exists
      if (data.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: data.companyId },
        });

        if (!company) {
          throw new Error("Company not found");
        }
      }

      // If updating city, check if it exists
      if (data.cityId) {
        const city = await prisma.city.findUnique({
          where: { id: data.cityId },
        });

        if (!city) {
          throw new Error("City not found");
        }
      }

      // Update driver
      const driver = await prisma.driver.update({
        where: { id: Number(id) },
        data: data,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          location: true,
        },
      });

      return driver;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await prisma.driver.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Driver deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete driver: ${error.message}`);
    }
  }

  async updateStatus(id, status) {
    console.log(id, status);
    try {
      if (!["offline", "online", "on_trip"].includes(status)) {
        throw new Error(
          "Invalid status. Must be one of: offline, online, on_trip"
        );
      }

      const driver = await prisma.driver.update({
        where: { id: Number(id) },
        data: { status },
      });

      return driver;
    } catch (error) {
      throw new Error(`Failed to update driver status: ${error.message}`);
    }
  }

  async updateLocation(id, locationData) {
    try {
      // Check if driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: Number(id) },
      });

      if (!driver) {
        throw new Error("Driver not found");
      }

      // Check if location exists for this driver
      const existingLocation = await prisma.location.findUnique({
        where: { driverId: Number(id) },
      });

      let location;

      if (existingLocation) {
        // Update existing location
        location = await prisma.location.update({
          where: { driverId: Number(id) },
          data: locationData,
        });
      } else {
        // Create new location
        location = await prisma.location.create({
          data: {
            ...locationData,
            driverId: Number(id),
          },
        });
      }

      return location;
    } catch (error) {
      throw error;
    }
  }

  async addAvailability(data) {
    try {
      // Check if driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: data.driverId },
      });

      if (!driver) {
        throw new Error("Driver not found");
      }

      // Check for overlapping availability
      const overlappingAvailability = await prisma.driverAvailability.findFirst(
        {
          where: {
            driverId: data.driverId,
            OR: [
              {
                startTime: {
                  lte: new Date(data.endTime),
                },
                endTime: {
                  gte: new Date(data.startTime),
                },
              },
            ],
          },
        }
      );

      if (overlappingAvailability) {
        throw new Error("This time slot overlaps with existing availability");
      }

      // Create availability
      const availability = await prisma.driverAvailability.create({
        data: {
          driverId: data.driverId,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
        },
      });

      return availability;
    } catch (error) {
      throw error;
    }
  }

  async removeAvailability(id) {
    try {
      await prisma.driverAvailability.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Availability removed successfully" };
    } catch (error) {
      throw new Error(`Failed to remove availability: ${error.message}`);
    }
  }

  async getNearbyDrivers(
    lat,
    lng,
    radius = 5,
    companyId = null,
    cityId = null
  ) {
    // Start building the query parts
    const selectPart = `
        SELECT 
            d.*, 
            l.*, 
            c.name as cityName,
            (6371 * acos(
                cos(radians(?)) * cos(radians(l.lat)) * 
                cos(radians(l.lng) - radians(?)) + 
                sin(radians(?)) * sin(radians(l.lat))
            )) AS distance
        FROM driver d
        JOIN location l ON d.id = l.driverId
        JOIN city c ON d.cityId = c.id
    `;

    // Build WHERE conditions
    const whereConditions = ["d.status = 'online'"];
    const params = [lat, lng, lat]; // First three parameters for distance calculation

    if (companyId) {
      whereConditions.push("d.companyId = ?");
      params.push(companyId);
    }

    if (cityId) {
      whereConditions.push("d.cityId = ?");
      params.push(cityId);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Add radius parameter
    params.push(radius);

    const fullQuery = `
        ${selectPart}
        ${whereClause}
        HAVING distance < ?
        ORDER BY distance
        LIMIT 20
    `;

    try {
      console.log("Executing query:", fullQuery);
      console.log("With parameters:", params);

      const drivers = await prisma.$queryRawUnsafe(fullQuery, ...params);
      return drivers;
    } catch (error) {
      console.error("Error in getNearbyDrivers:", error);
      throw new Error(`Failed to fetch nearby drivers: ${error.message}`);
    }
  }
  async getDriversByCity(cityId, status = null) {
    try {
      const whereClause = {
        cityId: Number(cityId),
      };

      if (status) {
        whereClause.status = status;
      }

      const drivers = await prisma.driver.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          location: true,
        },
      });

      return drivers;
    } catch (error) {
      throw new Error(`Failed to get drivers by city: ${error.message}`);
    }
  }

  async getDriversByCompany(companyId, status = null) {
    console.log("&&&&&&&&& dravers");
    try {
      const whereClause = {
        companyId: Number(companyId),
      };

      if (status) {
        whereClause.status = status;
      }

      const drivers = await prisma.driver.findMany({
        where: whereClause,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          city: {
            select: {
              id: true,
              name: true,
            },
          },
          location: true,
        },
      });

      return drivers;
    } catch (error) {
      throw new Error(`Failed to get drivers by company: ${error.message}`);
    }
  }
}

module.exports = new DriverService();
