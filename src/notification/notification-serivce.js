const { PrismaClient } = require("@prisma/client");

// Notification types enum
const NotificationType = {
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_ASSIGNED: "BOOKING_ASSIGNED",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  DRIVER_ASSIGNED: "DRIVER_ASSIGNED",
  DRIVER_STATUS_CHANGED: "DRIVER_STATUS_CHANGED",
  NEW_USER_REGISTERED: "NEW_USER_REGISTERED",
  COMPANY_APPROVED: "COMPANY_APPROVED",
};

class NotificationService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createNotification(createNotificationDto) {
    try {
      return await this.prisma.notification.create({
        data: {
          type: createNotificationDto.type,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          userId: createNotificationDto.userId || null,
          companyId: createNotificationDto.companyId || null,
          bookingId: createNotificationDto.bookingId || null,
          isRead: false,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  async createCompanyNotification(companyId, createNotificationDto) {
    try {
      return await this.prisma.notification.create({
        data: {
          type: createNotificationDto.type,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          companyId: Number(companyId),
          userId: createNotificationDto.userId || null,
          bookingId: createNotificationDto.bookingId || null,
          isRead: false,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to create company notification: ${error.message}`
      );
    }
  }

  async getAllNotifications(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            booking: {
              select: {
                id: true,
                pickup: true,
                dropoff: true,
              },
            },
          },
        }),
        this.prisma.notification.count(),
      ]);

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  async getAllUnreadNotifications() {
    try {
      return await this.prisma.notification.findMany({
        where: {
          isRead: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              pickup: true,
              dropoff: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch unread notifications: ${error.message}`);
    }
  }

  async getCompanyNotifications(companyId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where: {
            companyId: Number(companyId),
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            booking: {
              select: {
                id: true,
                pickup: true,
                dropoff: true,
              },
            },
          },
        }),
        this.prisma.notification.count({
          where: {
            companyId: Number(companyId),
          },
        }),
      ]);

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch company notifications: ${error.message}`
      );
    }
  }

  async getCompanyUnreadNotifications(companyId) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          companyId: Number(companyId),
          isRead: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              pickup: true,
              dropoff: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch company unread notifications: ${error.message}`
      );
    }
  }

  async getNotificationById(id) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id: Number(id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              pickup: true,
              dropoff: true,
            },
          },
        },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      return notification;
    } catch (error) {
      if (error.message === "Notification not found") {
        throw error;
      }
      throw new Error(`Failed to fetch notification: ${error.message}`);
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const notification = await this.prisma.notification.update({
        where: { id: Number(notificationId) },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      if (error.message.includes("Record to update not found")) {
        throw new Error("Notification not found");
      }
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markCompanyNotificationAsRead(notificationId) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: Number(notificationId),
          companyId: { not: null },
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      if (error.message.includes("Record to update not found")) {
        throw new Error("Company notification not found");
      }
      throw new Error(
        `Failed to mark company notification as read: ${error.message}`
      );
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return { count: result.count };
    } catch (error) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  }

  async markAllCompanyNotificationsAsRead(companyId) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          companyId: Number(companyId),
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return { count: result.count };
    } catch (error) {
      throw new Error(
        `Failed to mark all company notifications as read: ${error.message}`
      );
    }
  }

  async deleteNotification(id) {
    try {
      await this.prisma.notification.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Notification deleted successfully" };
    } catch (error) {
      if (error.message.includes("Record to delete not found")) {
        throw new Error("Notification not found");
      }
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  async deleteCompanyNotification(notificationId) {
    try {
      await this.prisma.notification.delete({
        where: {
          id: Number(notificationId),
          companyId: { not: null },
        },
      });

      return {
        success: true,
        message: "Company notification deleted successfully",
      };
    } catch (error) {
      if (error.message.includes("Record to delete not found")) {
        throw new Error("Company notification not found");
      }
      throw new Error(
        `Failed to delete company notification: ${error.message}`
      );
    }
  }

  async getRecentNotifications(limit = 10) {
    try {
      return await this.prisma.notification.findMany({
        take: Number(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          booking: {
            select: {
              id: true,
              pickup: true,
              dropoff: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch recent notifications: ${error.message}`);
    }
  }

  async getRecentCompanyNotifications(companyId, limit = 10) {
    try {
      return await this.prisma.notification.findMany({
        where: {
          companyId: Number(companyId),
        },
        take: Number(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              pickup: true,
              dropoff: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch recent company notifications: ${error.message}`
      );
    }
  }

  async searchNotifications(query, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                message: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            booking: {
              select: {
                id: true,
                pickup: true,
                dropoff: true,
              },
            },
          },
        }),
        this.prisma.notification.count({
          where: {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                message: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
      ]);

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to search notifications: ${error.message}`);
    }
  }

  async getNotificationsByType(type, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await this.prisma.$transaction([
        this.prisma.notification.findMany({
          where: {
            type: type,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            booking: {
              select: {
                id: true,
                pickup: true,
                dropoff: true,
              },
            },
          },
        }),
        this.prisma.notification.count({
          where: {
            type: type,
          },
        }),
      ]);

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch notifications by type: ${error.message}`
      );
    }
  }
}

module.exports = new NotificationService();
