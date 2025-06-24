const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class StatsService {
  async getDashboardStats() {
    const [
      totalCompanies,
      approvedCompanies,
      unapprovedCompanies,
      totalDrivers,
      activeDrivers,
      totalBookings,
      completedBookings,
      pendingBookings,
      totalCustomers,
      recentBookings,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isApproved: true } }),
      prisma.company.count({ where: { isApproved: false } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: { in: ["online", "on_trip"] } } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "completed" } }),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.customer.count(),
      prisma.booking.findMany({
        take: 10,
        orderBy: { requestedAt: "desc" },
        include: {
          company: {
            select: {
              name: true,
            },
          },
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          driver: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      companies: {
        total: totalCompanies,
        approved: approvedCompanies,
        unapproved: unapprovedCompanies,
      },
      drivers: { total: totalDrivers, active: activeDrivers },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        recent: recentBookings.map((booking) => ({
          id: booking.id,
          pickup: booking.pickup,
          dropoff: booking.dropoff,
          status: booking.status,
          requestedAt: booking.requestedAt,
          companyName: booking.company?.name || "N/A",
          customerName: booking.customer?.name || "N/A",
          driverName: booking.driver?.name || "Unassigned",
        })),
      },
      customers: { total: totalCustomers },
    };
  }
}

module.exports = new StatsService();
