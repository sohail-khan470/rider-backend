const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fullBookingInclude = {
  customer: true,
  driver: true,
  company: {
    include: {
      contact: true,
      addresses: true,
      profile: true,
    },
  },
};

class BookingService {
  async getBookingsByCompany(companyId) {
    try {
      const data = await prisma.booking.findMany({
        where: { companyId: Number(companyId) },
        include: fullBookingInclude,
      });

      return data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  }

  async create(data) {
    try {
      // Check if customer exists and belongs to the company
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) throw new Error("Customer not found");
      if (customer.companyId !== data.companyId) {
        throw new Error("Customer does not belong to this company");
      }

      // If driver is specified, check and update driver status
      if (data.driverId) {
        const driver = await prisma.driver.findUnique({
          where: { id: data.driverId },
        });
        if (!driver) throw new Error("Driver not found");
        if (driver.companyId !== data.companyId) {
          throw new Error("Driver does not belong to this company");
        }
        if (driver.status !== "online") {
          throw new Error("Driver is not available");
        }
        await prisma.driver.update({
          where: { id: data.driverId },
          data: { status: "on_trip" },
        });
      }

      // Create booking
      const booking = await prisma.booking.create({
        data,
        include: {
          customer: true,
          driver: data.driverId ? true : false,
          company: { select: { id: true, name: true } },
        },
      });
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters = {}) {
    const bookings = await prisma.booking.findMany({
      where: filters,
      orderBy: { requestedAt: "desc" },
      include: fullBookingInclude,
    });
    const total = await prisma.booking.count({ where: filters });
    return { data: bookings, total };
  }

  async findById(id) {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: fullBookingInclude,
    });
    if (!booking) throw new Error("Booking not found");
    return booking;
  }

  async update(id, data) {
    try {
      const currentBooking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: { driver: true },
      });
      if (!currentBooking) throw new Error("Booking not found");

      // Handle driver change
      if (data.driverId && data.driverId !== currentBooking.driverId) {
        const driver = await prisma.driver.findUnique({
          where: { id: data.driverId },
        });
        if (!driver) throw new Error("Driver not found");
        if (driver.companyId !== currentBooking.companyId) {
          throw new Error("Driver does not belong to this company");
        }
        if (driver.status !== "online") {
          throw new Error("Driver is not available");
        }
        await prisma.driver.update({
          where: { id: data.driverId },
          data: { status: "on_trip" },
        });
        if (currentBooking.driverId) {
          await prisma.driver.update({
            where: { id: currentBooking.driverId },
            data: { status: "online" },
          });
        }
      }

      // Handle status changes
      if (data.status) {
        if (
          (data.status === "completed" || data.status === "cancelled") &&
          currentBooking.driverId
        ) {
          await prisma.driver.update({
            where: { id: currentBooking.driverId },
            data: { status: "online" },
          });
        }
        if (data.status === "accepted" && currentBooking.driverId) {
          await prisma.driver.update({
            where: { id: currentBooking.driverId },
            data: { status: "on_trip" },
          });
        }
      }

      // Update booking
      const booking = await prisma.booking.update({
        where: { id: Number(id) },
        data,
        include: fullBookingInclude,
      });
      return booking;
    } catch (error) {
      throw error;
    }
  }

  async assignDriver(bookingId, driverId) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(bookingId) },
      });
      if (!booking) throw new Error("Booking not found");
      if (booking.driverId)
        throw new Error("Booking already has a driver assigned");
      if (booking.status !== "pending")
        throw new Error(
          "Cannot assign driver to a booking that is not pending"
        );

      const driver = await prisma.driver.findUnique({
        where: { id: Number(driverId) },
      });
      if (!driver) throw new Error("Driver not found");
      if (driver.companyId !== booking.companyId)
        throw new Error("Driver does not belong to this company");
      if (driver.status !== "online")
        throw new Error("Driver is not available");

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: Number(bookingId) },
          data: { driverId: Number(driverId), status: "accepted" },
        }),
        prisma.driver.update({
          where: { id: Number(driverId) },
          data: { status: "on_trip" },
        }),
      ]);

      const updatedBooking = await this.findById(bookingId);

      return updatedBooking;
    } catch (error) {
      throw error;
    }
  }

  async cancelBooking(id) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: fullBookingInclude,
      });
      if (!booking) throw new Error("Booking not found");
      if (["completed", "cancelled"].includes(booking.status)) {
        throw new Error(
          "Cannot cancel a booking that is already completed or cancelled"
        );
      }
      const updatedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "cancelled" },
        include: fullBookingInclude,
      });
      if (booking.driverId) {
        await prisma.driver.update({
          where: { id: booking.driverId },
          data: { status: "online" },
          include: fullBookingInclude,
        });
      }
      return {
        success: true,
        message: "Booking cancelled successfully",
        updatedBooking,
      };
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  async completeBooking(id, fareData = {}) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: fullBookingInclude,
      });
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "ongoing")
        throw new Error("Cannot complete a booking that is not ongoing");
      const updatedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "completed", fare: fareData.fare || booking.fare },
        include: fullBookingInclude,
      });
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
      let dateFilter = {};
      const now = new Date();
      if (period === "day") {
        dateFilter = {
          requestedAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
        };
      } else if (period === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        dateFilter = { requestedAt: { gte: oneWeekAgo } };
      } else if (period === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        dateFilter = { requestedAt: { gte: oneMonthAgo } };
      }
      const bookings = await prisma.booking.findMany({
        where: { companyId: Number(companyId), ...dateFilter },
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

  async acceptBooking(id) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: fullBookingInclude,
      });
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "pending") {
        throw new Error("Only pending bookings can be accepted");
      }
      if (!booking.driverId) {
        throw new Error("Cannot accept booking without a driver assigned");
      }

      await prisma.$transaction([
        await prisma.booking.update({
          where: { id: Number(id) },
          data: { status: "accepted" },
          include: fullBookingInclude,
        }),
        await prisma.driver.update({
          where: { id: booking.driverId },
          data: { status: "on_trip" },
        }),
      ]);

      const updatedBooking = await prisma.booking.findUnique({
        where: { id: Number(id) },
        include: fullBookingInclude,
      });

      return updatedBooking;
    } catch (error) {
      throw new Error(`Failed to accept booking: ${error.message}`);
    }
  }

  async startTrip(id) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: Number(id) },
      });
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "accepted") {
        throw new Error("Only accepted bookings can be started");
      }
      const updatedBooking = await prisma.booking.update({
        where: { id: Number(id) },
        data: { status: "ongoing" },
        include: fullBookingInclude,
      });
      return updatedBooking;
    } catch (error) {
      throw new Error(`Failed to start trip: ${error.message}`);
    }
  }
}

module.exports = new BookingService();
