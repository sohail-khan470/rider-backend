const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
const createBookingSchema = z.object({
  customerId: z
    .number()
    .int()
    .positive("Customer ID must be a positive integer"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
  pickup: z.string().min(3, "Pickup location must be at least 3 characters"),
  dropoff: z.string().min(3, "Dropoff location must be at least 3 characters"),
  driverId: z
    .number()
    .int()
    .positive("Driver ID must be a positive integer")
    .optional(),
  fare: z.number().positive("Fare must be a positive number").optional(),
});

const updateBookingSchema = z.object({
  customerId: z
    .number()
    .int()
    .positive("Customer ID must be a positive integer")
    .optional(),
  driverId: z
    .number()
    .int()
    .positive("Driver ID must be a positive integer")
    .optional(),
  pickup: z
    .string()
    .min(3, "Pickup location must be at least 3 characters")
    .optional(),
  dropoff: z
    .string()
    .min(3, "Dropoff location must be at least 3 characters")
    .optional(),
  status: z
    .enum(["pending", "accepted", "ongoing", "completed", "cancelled"])
    .optional(),
  fare: z.number().positive("Fare must be a positive number").optional(),
});

class BookingService {
  async getBookingsByCompany(companyId) {
    try {
      const data = await prisma.booking.findMany({
        where: {
          companyId: Number(companyId), // ✅ Correct field
        },
      });

      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  }

  async create(data) {
    try {
      // Validate input data
      const validatedData = createBookingSchema.parse(data);

      // Check if customer exists and belongs to the company
      const customer = await prisma.customer.findUnique({
        where: {
          id: validatedData.customerId,
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      if (customer.companyId !== validatedData.companyId) {
        throw new Error("Customer does not belong to this company");
      }

      // If driver is specified, check if driver exists and belongs to the company
      if (validatedData.driverId) {
        const driver = await prisma.driver.findUnique({
          where: { id: validatedData.driverId },
        });

        if (!driver) {
          throw new Error("Driver not found");
        }

        if (driver.companyId !== validatedData.companyId) {
          throw new Error("Driver does not belong to this company");
        }

        // Check if driver is available
        if (driver.status !== "online") {
          throw new Error("Driver is not available");
        }

        // Update driver status to on_trip
        await prisma.driver.update({
          where: { id: validatedData.driverId },
          data: { status: "on_trip" },
        });
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: validatedData,
        include: {
          customer: true,
          driver: validatedData.driverId ? true : false,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return booking;
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
    const bookings = await prisma.booking.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        requestedAt: "desc",
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleInfo: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.booking.count({ where: filters });

    return {
      data: bookings,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }

  async findById(id) {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        driver: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }

  async update(id, data) {
    try {
      // Validate input data
      const validatedData = updateBookingSchema.parse(data);

      // Get current booking
      const currentBooking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: {
          driver: true,
        },
      });

      if (!currentBooking) {
        throw new Error("Booking not found");
      }

      // If changing driver, check if new driver exists and belongs to the same company
      if (
        validatedData.driverId &&
        validatedData.driverId !== currentBooking.driverId
      ) {
        const driver = await prisma.driver.findUnique({
          where: { id: validatedData.driverId },
        });

        if (!driver) {
          throw new Error("Driver not found");
        }

        if (driver.companyId !== currentBooking.companyId) {
          throw new Error("Driver does not belong to this company");
        }

        // Check if driver is available
        if (driver.status !== "online") {
          throw new Error("Driver is not available");
        }

        // Update driver status to on_trip
        await prisma.driver.update({
          where: { id: validatedData.driverId },
          data: { status: "on_trip" },
        });

        // If there was a previous driver, update their status back to online
        if (currentBooking.driverId) {
          await prisma.driver.update({
            where: { id: currentBooking.driverId },
            data: { status: "online" },
          });
        }
      }

      // Handle status changes
      if (validatedData.status) {
        // If status is completed or cancelled, set driver back to online
        if (
          (validatedData.status === "completed" ||
            validatedData.status === "cancelled") &&
          currentBooking.driverId
        ) {
          await prisma.driver.update({
            where: { id: currentBooking.driverId },
            data: { status: "online" },
          });
        }

        // If status is accepted and there's a driver, set driver to on_trip
        if (validatedData.status === "accepted" && currentBooking.driverId) {
          await prisma.driver.update({
            where: { id: currentBooking.driverId },
            data: { status: "on_trip" },
          });
        }
      }

      // Update booking
      const booking = await prisma.booking.update({
        where: { id: Number(id) },
        data: validatedData,
        include: {
          customer: true,
          driver: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return booking;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async assignDriver(bookingId, driverId) {
    try {
      // Get booking
      const booking = await prisma.booking.findUnique({
        where: { id: Number(bookingId) },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check if booking already has a driver
      if (booking.driverId) {
        throw new Error("Booking already has a driver assigned");
      }

      // Check if booking is in a state that allows driver assignment
      if (booking.status !== "pending") {
        throw new Error(
          "Cannot assign driver to a booking that is not pending"
        );
      }

      // Check if driver exists and belongs to the same company
      const driver = await prisma.driver.findUnique({
        where: { id: Number(driverId) },
      });

      if (!driver) {
        throw new Error("Driver not found");
      }

      if (driver.companyId !== booking.companyId) {
        throw new Error("Driver does not belong to this company");
      }

      // Check if driver is available
      if (driver.status !== "online") {
        throw new Error("Driver is not available");
      }

      // Update booking and driver status
      const updatedBooking = await prisma.$transaction([
        prisma.booking.update({
          where: { id: Number(bookingId) },
          data: {
            driverId: Number(driverId),
            status: "accepted",
          },
        }),
        prisma.driver.update({
          where: { id: Number(driverId) },
          data: { status: "on_trip" },
        }),
      ]);

      return updatedBooking[0];
    } catch (error) {
      throw new Error(`Failed to assign driver: ${error.message}`);
    }
  }

  async cancelBooking(id) {
    try {
      // Get booking
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: {
          driver: true,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check if booking can be cancelled
      if (["completed", "cancelled"].includes(booking.status)) {
        throw new Error(
          "Cannot cancel a booking that is already completed or cancelled"
        );
      }

      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "cancelled" },
      });

      // If there was a driver, update their status back to online
      if (booking.driverId) {
        await prisma.driver.update({
          where: { id: booking.driverId },
          data: { status: "online" },
        });
      }

      return { success: true, message: "Booking cancelled successfully" };
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  async completeBooking(id, fareData = {}) {
    try {
      // Get booking
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check if booking can be completed
      if (booking.status !== "ongoing") {
        throw new Error("Cannot complete a booking that is not ongoing");
      }

      // Update booking status and fare if provided
      const updatedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: {
          status: "completed",
          fare: fareData.fare || booking.fare,
        },
      });

      // Update driver status back to online
      if (booking.driverId) {
        await prisma.driver.update({
          where: { id: booking.driverId },
          data: { status: "online" },
        });
      }

      return updatedBooking;
    } catch (error) {
      throw new Error(`Failed to complete booking: ${error.message}`);
    }
  }

  async getBookingStatistics(companyId, period = "day") {
    try {
      let dateFilter;
      const now = new Date();

      switch (period) {
        case "day":
          dateFilter = {
            requestedAt: {
              gte: new Date(now.setHours(0, 0, 0, 0)),
            },
          };
          break;
        case "week":
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          dateFilter = {
            requestedAt: {
              gte: oneWeekAgo,
            },
          };
          break;
        case "month":
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          dateFilter = {
            requestedAt: {
              gte: oneMonthAgo,
            },
          };
          break;
        default:
          dateFilter = {};
      }

      const bookings = await prisma.booking.findMany({
        where: {
          companyId: Number(companyId),
          ...dateFilter,
        },
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(
        (b) => b.status === "completed"
      ).length;
      const cancelledBookings = bookings.filter(
        (b) => b.status === "cancelled"
      ).length;
      const totalRevenue = bookings
        .filter((b) => b.status === "completed" && b.fare)
        .reduce((sum, b) => sum + b.fare, 0);

      return {
        totalBookings,
        completedBookings,
        cancelledBookings,
        completionRate:
          totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        cancellationRate:
          totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
        totalRevenue,
      };
    } catch (error) {
      throw new Error(`Failed to get booking statistics: ${error.message}`);
    }
  }
}

module.exports = new BookingService();
