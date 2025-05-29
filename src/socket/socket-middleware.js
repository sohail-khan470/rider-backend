// middleware/socketMiddleware.js
const socketManager = require("./socketManager");

// Middleware to add socket functionality to requests
const socketMiddleware = (req, res, next) => {
  // Add socket helper functions to request object
  req.socket = {
    // Emit to specific user
    emitToUser: (userId, event, data) => {
      return socketManager.emitToUser(userId, event, data);
    },

    // Emit to company
    emitToCompany: (companyId, event, data) => {
      return socketManager.emitToCompany(companyId, event, data);
    },

    // Emit to super admins
    emitToSuperAdmins: (event, data) => {
      return socketManager.emitToSuperAdmins(event, data);
    },

    // Emit notification (intelligent routing)
    emitNotification: (notification) => {
      return socketManager.emitNotification(notification);
    },

    // Check if user is connected
    isUserConnected: (userId) => {
      return socketManager.isUserConnected(userId);
    },

    // Get connected users count
    getConnectedUsersCount: () => {
      return socketManager.getConnectedUsersCount();
    },
  };

  next();
};

module.exports = socketMiddleware;

// utils/socketEmitter.js - Utility functions for emitting socket events
class SocketEmitter {
  static emitNotificationCreated(notification) {
    const socketManager = require("./socketManager");

    // Emit new notification event
    socketManager.emitNotification(notification);

    console.log(
      `Notification emitted: ${notification.title} to user ${notification.userId} and company ${notification.companyId}`
    );
  }

  static emitNotificationRead(notificationId, userId, companyId) {
    const socketManager = require("./socketManager");
    const io = socketManager.getIO();

    if (io) {
      // Emit to user's room
      io.to(`user_${userId}`).emit("notificationRead", notificationId);

      // Emit to company room if applicable
      if (companyId) {
        io.to(`company_${companyId}`).emit("notificationRead", notificationId);
      }
    }
  }

  static emitAllNotificationsRead(userRole, companyId) {
    const socketManager = require("./socketManager");
    const io = socketManager.getIO();

    if (io) {
      if (userRole === "super_admin") {
        io.to("super_admin").emit("allNotificationsRead");
      } else if (companyId) {
        io.to(`company_${companyId}`).emit("allNotificationsRead");
      }
    }
  }

  static emitNotificationDeleted(notificationId, userId, companyId) {
    const socketManager = require("./socketManager");
    const io = socketManager.getIO();

    if (io) {
      // Emit to user's room
      if (userId) {
        io.to(`user_${userId}`).emit("notificationDeleted", notificationId);
      }

      // Emit to company room if applicable
      if (companyId) {
        io.to(`company_${companyId}`).emit(
          "notificationDeleted",
          notificationId
        );
      }

      // Emit to super admins
      io.to("super_admin").emit("notificationDeleted", notificationId);
    }
  }

  static emitBookingStatusUpdate(booking, companyId) {
    const socketManager = require("./socketManager");

    // Create notification data
    const notificationData = {
      type: "BOOKING_STATUS_CHANGED",
      title: `Booking Status Updated`,
      message: `Booking #${booking.id} status changed to ${booking.status}`,
      bookingId: booking.id,
      companyId: companyId,
    };

    socketManager.emitToCompany(companyId, "bookingStatusUpdate", {
      booking,
      notification: notificationData,
    });
  }

  static emitDriverAssignment(driverId, bookingId, companyId) {
    const socketManager = require("./socketManager");

    // Emit to driver
    socketManager.emitToUser(driverId, "driverAssigned", {
      bookingId,
      message: "You have been assigned to a new booking",
    });

    // Emit to company
    socketManager.emitToCompany(companyId, "driverAssigned", {
      driverId,
      bookingId,
      message: "Driver has been assigned to booking",
    });
  }

  static emitNewUserRegistration(user, companyId) {
    const socketManager = require("./socketManager");

    const notificationData = {
      type: "NEW_USER_REGISTERED",
      title: "New User Registered",
      message: `${user.name} has registered`,
      userId: user.id,
      companyId: companyId,
    };

    // Emit to company admins
    if (companyId) {
      socketManager.emitToCompany(companyId, "newUserRegistered", {
        user,
        notification: notificationData,
      });
    }

    // Emit to super admins
    socketManager.emitToSuperAdmins("newUserRegistered", {
      user,
      notification: notificationData,
    });
  }

  static emitCompanyApproval(company) {
    const socketManager = require("./socketManager");

    const notificationData = {
      type: "COMPANY_APPROVED",
      title: "Company Approved",
      message: `Company ${company.name} has been approved`,
      companyId: company.id,
    };

    // Emit to company
    socketManager.emitToCompany(company.id, "companyApproved", {
      company,
      notification: notificationData,
    });

    // Emit to super admins
    socketManager.emitToSuperAdmins("companyApproved", {
      company,
      notification: notificationData,
    });
  }
}

module.exports = { socketMiddleware, SocketEmitter };
