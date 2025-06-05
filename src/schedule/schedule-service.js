const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  BookingStatus,
  ScheduleStatus,
  DriverStatus,
} = require("@prisma/client");

class ScheduleService {
  constructor() {}

  async createSchedule(data) {
    try {
      // Validate driver availability
      const conflictingSchedules = await prisma.schedule.findMany({
        where: {
          driverId: data.driverId,
          OR: [
            {
              departure: { lte: data.estimatedArrival },
              estimatedArrival: { gte: data.departure },
            },
            {
              returnTime: { not: null },
              departure: { lte: data.returnTime || data.estimatedArrival },
              estimatedArrival: { gte: data.departure },
            },
          ],
        },
      });

      if (conflictingSchedules.length > 0) {
        throw new Error("Driver has conflicting schedules");
      }

      // Create the schedule
      const schedule = await prisma.schedule.create({
        data: {
          companyId: data.companyId,
          driverId: data.driverId,
          fromCityId: data.fromCityId,
          toCityId: data.toCityId,
          departure: data.departure,
          estimatedArrival: data.estimatedArrival,
          returnTime: data.returnTime || null,
          status: "scheduled",
        },
        include: {
          driver: true,
          fromCity: true,
          toCity: true,
          company: true,
        },
      });

      // Update driver status if needed
      await prisma.driver.update({
        where: { id: data.driverId },
        data: { status: "on_trip" }, // or 'unavailable' if you add that status
      });

      return schedule;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async updateSchedule(id, data) {
    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          driver: true,
          fromCity: true,
          toCity: true,
          company: true,
        },
      });

      return this.getScheduleById(schedule.id);
    } catch (error) {
      throw error;
    }
  }

  async cancelSchedule(id) {
    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          status: "cancelled",
          updatedAt: new Date(),
        },
        include: {
          returnBookings: true,
        },
      });

      // Cancel all associated return bookings
      if (schedule.returnBookings.length > 0) {
        await prisma.booking.updateMany({
          where: {
            id: { in: schedule.returnBookings.map((b) => b.id) },
          },
          data: {
            status: "cancelled",
            updatedAt: new Date(),
          },
        });
      }

      // Update driver status if needed
      await prisma.driver.update({
        where: { id: schedule.driverId },
        data: { status: "online" },
      });

      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async startTrip(id) {
    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          status: "in_progress",
          updatedAt: new Date(),
        },
      });

      // Update driver status
      await prisma.driver.update({
        where: { id: schedule.driverId },
        data: { status: "on_trip" },
      });

      return schedule;
    } catch (error) {
      throw error;
    }
  }
  async markArrived(id, returnTime = null) {
    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          status: "arrived",
          returnTime,
          updatedAt: new Date(),
        },
      });

      // Update driver status to available for return trips
      await prisma.driver.update({
        where: { id: schedule.driverId },
        data: { status: "online" },
      });

      // Create availability window for return trips
      if (returnTime) {
        await prisma.driverAvailability.create({
          data: {
            driverId: schedule.driverId,
            startTime: returnTime,
            endTime: new Date(returnTime.getTime() + 12 * 60 * 60 * 1000), // 12 hour window
          },
        });
      }

      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async startReturn(id) {
    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          status: "returning",
          updatedAt: new Date(),
        },
      });

      // Update driver status
      await prisma.driver.update({
        where: { id: schedule.driverId },
        data: { status: "on_trip" },
      });

      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async completeSchedule(id) {
    try {
      const schedule = await prisma.schedule.update({
        where: { id },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      });

      // Update driver status
      await prisma.driver.update({
        where: { id: schedule.driverId },
        data: { status: "online" },
      });

      return schedule;
    } catch (error) {
      throw error;
    }
  }

  async getAvailableReturnSchedules(cityId, destinationCityId, date = null) {
    try {
      const where = {
        toCityId: cityId,
        fromCityId: destinationCityId,
        status: "arrived",
        returnTime: { not: null },
      };

      if (date) {
        where.returnTime = {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        };
      }

      return await prisma.schedule.findMany({
        where,
        include: {
          driver: true,
          toCity: true,
          fromCity: true,
          company: true,
        },
        orderBy: {
          returnTime: "asc",
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getScheduleById(id) {
    try {
      return await prisma.schedule.findUnique({
        where: { id },
        include: {
          driver: true,
          fromCity: true,
          toCity: true,
          company: true,
          returnBookings: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getCompanySchedules(companyId, filters = {}) {
    try {
      const where = { companyId };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.OR = [
          {
            departure: {
              gte: filters.startDate || new Date(0),
              lte: filters.endDate || new Date("2100-01-01"),
            },
          },
          {
            returnTime: {
              gte: filters.startDate || new Date(0),
              lte: filters.endDate || new Date("2100-01-01"),
            },
          },
        ];
      }

      return await prisma.schedule.findMany({
        where,
        include: {
          driver: true,
          fromCity: true,
          toCity: true,
          returnBookings: true,
        },
        orderBy: {
          departure: "asc",
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ScheduleService();
