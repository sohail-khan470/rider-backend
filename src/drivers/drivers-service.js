const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
const createDriverSchema = z.object({
  name: z.string().min(2, "Driver name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  vehicleInfo: z.string().min(5, "Vehicle info must be at least 5 characters"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
  status: z
    .enum(["offline", "online", "on_trip"])
    .optional()
    .default("offline"),
});

const updateDriverSchema = z.object({
  name: z
    .string()
    .min(2, "Driver name must be at least 2 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  vehicleInfo: z
    .string()
    .min(5, "Vehicle info must be at least 5 characters")
    .optional(),
  status: z.enum(["offline", "online", "on_trip"]).optional(),
  companyId: z
    .number()
    .int()
    .positive("Company ID must be a positive integer")
    .optional(),
});

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const createAvailabilitySchema = z
  .object({
    driverId: z.number().int().positive(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

class DriverService {
  async create(data) {
    try {
      // Validate input data
      const validatedData = createDriverSchema.parse(data);

      // Check if driver with email already exists
      const existingDriver = await prisma.driver.findUnique({
        where: { email: validatedData.email },
      });

      if (existingDriver) {
        throw new Error("Driver with this email already exists");
      }

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Create driver
      const driver = await prisma.driver.create({
        data: validatedData,
      });

      return driver;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async findAll(filters = {}, pagination = { skip: 0, take: 10 }) {
    const drivers = await prisma.driver.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        company: {
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
    });

    const total = await prisma.driver.count({ where: filters });

    return {
      data: drivers,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }

  async findById(id) {
    const driver = await prisma.driver.findUnique({
      where: { id: Number(id) },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        location: true,
        bookings: {
          take: 5,
          orderBy: {
            requestedAt: "desc",
          },
        },
        availability: {
          where: {
            endTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: "asc",
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
      // Validate input data
      const validatedData = updateDriverSchema.parse(data);

      // If updating email, check if it's already taken
      if (validatedData.email) {
        const existingDriver = await prisma.driver.findFirst({
          where: {
            email: validatedData.email,
            id: { not: Number(id) },
          },
        });

        if (existingDriver) {
          throw new Error("Email is already taken by another driver");
        }
      }

      // If updating company, check if it exists
      if (validatedData.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: validatedData.companyId },
        });

        if (!company) {
          throw new Error("Company not found");
        }
      }

      // Update driver
      const driver = await prisma.driver.update({
        where: { id: Number(id) },
        data: validatedData,
        include: {
          company: {
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
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
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
      const validatedData = updateLocationSchema.parse(locationData);

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
          data: validatedData,
        });
      } else {
        // Create new location
        location = await prisma.location.create({
          data: {
            ...validatedData,
            driverId: Number(id),
          },
        });
      }

      return location;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async addAvailability(data) {
    try {
      const validatedData = createAvailabilitySchema.parse(data);

      // Check if driver exists
      const driver = await prisma.driver.findUnique({
        where: { id: validatedData.driverId },
      });

      if (!driver) {
        throw new Error("Driver not found");
      }

      // Check for overlapping availability
      const overlappingAvailability = await prisma.driverAvailability.findFirst(
        {
          where: {
            driverId: validatedData.driverId,
            OR: [
              {
                startTime: {
                  lte: new Date(validatedData.endTime),
                },
                endTime: {
                  gte: new Date(validatedData.startTime),
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
          driverId: validatedData.driverId,
          startTime: new Date(validatedData.startTime),
          endTime: new Date(validatedData.endTime),
        },
      });

      return availability;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
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

  async getNearbyDrivers(lat, lng, radius = 5, companyId = null) {
    // Using Haversine formula to calculate distance
    // This is a simplified approach - for production, consider using more advanced geospatial queries
    const drivers = await prisma.$queryRaw`
      SELECT d.*, l.*, 
        (6371 * acos(cos(radians(${lat})) * cos(radians(l.lat)) * cos(radians(l.lng) - radians(${lng})) + sin(radians(${lat})) * sin(radians(l.lat)))) AS distance
      FROM driver d
      JOIN location l ON d.id = l.driverId
      WHERE d.status = 'online'
      ${companyId ? prisma.sql`AND d.companyId = ${companyId}` : prisma.sql``}
      HAVING distance < ${radius}
      ORDER BY distance
      LIMIT 20
    `;

    return drivers;
  }
}

module.exports = new DriverService();
