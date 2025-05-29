// socket/socketManager.js
const { Server } = require("socket.io");

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userInfo
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL || "http://localhost:3000",
          "http://localhost:5173", // Add Vite default port
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true, // If using authentication
      },
      transports: ["websocket", "polling"], // Explicit transport specification
    });

    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Handle user authentication and joining rooms
      socket.on("authenticate", (authData) => {
        this.handleUserAuthentication(socket, authData);
      });

      // Handle user joining notification room
      socket.on("joinNotificationRoom", (userData) => {
        this.handleJoinNotificationRoom(socket, userData);
      });

      // Handle marking notification as read
      socket.on("markNotificationAsRead", (notificationId) => {
        this.handleMarkAsRead(socket, notificationId);
      });

      // Handle marking all notifications as read
      socket.on("markAllNotificationsAsRead", (userData) => {
        this.handleMarkAllAsRead(socket, userData);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });

    // Handle authentication through socket handshake
    this.io.use((socket, next) => {
      const { userId, userRole, companyId } = socket.handshake.auth;

      if (!userId || !userRole) {
        return next(new Error("Authentication required"));
      }

      socket.userId = parseInt(userId);
      socket.userRole = userRole;
      socket.companyId = companyId ? parseInt(companyId) : null;

      next();
    });

    console.log("Socket.IO server initialized");
    return this.io;
  }

  handleUserAuthentication(socket, authData) {
    const { userId, userRole, companyId } = authData;

    socket.userId = parseInt(userId);
    socket.userRole = userRole;
    socket.companyId = companyId ? parseInt(companyId) : null;

    // Store user connection
    this.connectedUsers.set(socket.userId, socket.id);
    this.userSockets.set(socket.id, {
      userId: socket.userId,
      userRole: socket.userRole,
      companyId: socket.companyId,
    });

    // Join appropriate rooms
    this.joinUserRooms(socket);

    console.log(
      `User ${socket.userId} authenticated with role ${socket.userRole}`
    );
  }

  handleJoinNotificationRoom(socket, userData) {
    const { userId, userRole, companyId } = userData;

    socket.userId = parseInt(userId);
    socket.userRole = userRole;
    socket.companyId = companyId ? parseInt(companyId) : null;

    this.joinUserRooms(socket);
  }

  joinUserRooms(socket) {
    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Join company room if user belongs to a company
    if (socket.companyId) {
      socket.join(`company_${socket.companyId}`);
    }

    // Join role-based rooms
    socket.join(`role_${socket.userRole}`);

    // Super admin joins all rooms
    if (socket.userRole === "super_admin") {
      socket.join("super_admin");
    }

    console.log(
      `User ${socket.userId} joined rooms: user_${socket.userId}, company_${socket.companyId}, role_${socket.userRole}`
    );
  }

  async handleMarkAsRead(socket, notificationId) {
    try {
      // Import here to avoid circular dependencies
      const NotificationService = require("../services/notification-service");

      await NotificationService.markNotificationAsRead(notificationId);

      // Emit to user's room
      socket
        .to(`user_${socket.userId}`)
        .emit("notificationRead", notificationId);

      // Also emit to company room if applicable
      if (socket.companyId) {
        socket
          .to(`company_${socket.companyId}`)
          .emit("notificationRead", notificationId);
      }

      console.log(
        `Notification ${notificationId} marked as read by user ${socket.userId}`
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      socket.emit("error", { message: "Failed to mark notification as read" });
    }
  }

  async handleMarkAllAsRead(socket, userData) {
    try {
      const NotificationService = require("../services/notification-service");

      if (socket.userRole === "super_admin") {
        await NotificationService.markAllNotificationsAsRead();
        socket.to("super_admin").emit("allNotificationsRead");
      } else if (socket.companyId) {
        await NotificationService.markAllCompanyNotificationsAsRead(
          socket.companyId
        );
        socket.to(`company_${socket.companyId}`).emit("allNotificationsRead");
      }

      console.log(`All notifications marked as read by user ${socket.userId}`);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      socket.emit("error", {
        message: "Failed to mark all notifications as read",
      });
    }
  }

  handleDisconnect(socket) {
    console.log("User disconnected:", socket.id);

    // Remove from connected users
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
    }
    this.userSockets.delete(socket.id);
  }

  // Method to emit notification to specific user
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
      return true;
    }
    return false;
  }

  // Method to emit notification to company
  emitToCompany(companyId, event, data) {
    if (this.io) {
      this.io.to(`company_${companyId}`).emit(event, data);
      return true;
    }
    return false;
  }

  // Method to emit to all super admins
  emitToSuperAdmins(event, data) {
    if (this.io) {
      this.io.to("super_admin").emit(event, data);
      return true;
    }
    return false;
  }

  // Method to emit notification based on user role and company
  emitNotification(notification) {
    if (!this.io) return false;

    // Emit to specific user if userId is provided
    if (notification.userId) {
      this.io
        .to(`user_${notification.userId}`)
        .emit("newNotification", notification);
    }

    // Emit to company if companyId is provided
    if (notification.companyId) {
      this.io
        .to(`company_${notification.companyId}`)
        .emit("newNotification", notification);
    }

    // Emit to all super admins
    this.io.to("super_admin").emit("newNotification", notification);

    return true;
  }

  // Get IO instance
  getIO() {
    return this.io;
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get user socket info
  getUserSocketInfo(userId) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      return this.userSockets.get(socketId);
    }
    return null;
  }
}

// Export singleton instance
module.exports = new SocketManager();
