// services/notificationService.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class NotificationService {
  async createNotification({
    type,
    title,
    message,
    userId,
    companyId,
    bookingId,
  }) {
    return await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        companyId,
        bookingId,
      },
    });
  }

  async getNotificationsForUser(userId) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { booking: true },
    });
  }

  async getNotificationsForCompany(companyId) {
    return await prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: { booking: true, user: true },
    });
  }

  async markAsRead(notificationId) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

module.exports = new NotificationService();
