const NotificationService = require("./notification-serivce");
const { NotificationType } = require("./notification-serivce");

class NotificationController {
  async createNotification(req, res) {
    try {
      const notification = await NotificationService.createNotification(
        req.body
      );
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async createCompanyNotification(req, res) {
    try {
      const { companyId } = req.params;
      const notification = await NotificationService.createCompanyNotification(
        companyId,
        req.body
      );
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllNotifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await NotificationService.getAllNotifications({
        page,
        limit,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllUnreadNotifications(req, res) {
    try {
      const notifications =
        await NotificationService.getAllUnreadNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCompanyNotifications(req, res) {
    try {
      const { companyId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const result = await NotificationService.getCompanyNotifications(
        companyId,
        { page, limit }
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCompanyUnreadNotifications(req, res) {
    try {
      const { companyId } = req.params;
      const notifications =
        await NotificationService.getCompanyUnreadNotifications(companyId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.getNotificationById(id);
      res.json(notification);
    } catch (error) {
      if (error.message === "Notification not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      if (error.message === "Notification not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async markCompanyNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification =
        await NotificationService.markCompanyNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      if (error.message === "Company notification not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async markAllNotificationsAsRead(req, res) {
    try {
      const result = await NotificationService.markAllNotificationsAsRead();
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async markAllCompanyNotificationsAsRead(req, res) {
    try {
      const { companyId } = req.params;
      const result =
        await NotificationService.markAllCompanyNotificationsAsRead(companyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const result = await NotificationService.deleteNotification(id);
      res.json(result);
    } catch (error) {
      if (error.message === "Notification not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async deleteCompanyNotification(req, res) {
    try {
      const { id } = req.params;
      const result = await NotificationService.deleteCompanyNotification(id);
      res.json(result);
    } catch (error) {
      if (error.message === "Company notification not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async getRecentNotifications(req, res) {
    console.log("%%%%%%%recent notifications");
    try {
      const { limit = 10 } = req.query;
      const notifications = await NotificationService.getRecentNotifications(
        limit
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRecentCompanyNotifications(req, res) {
    try {
      const companyId = req.params.companyId || req.user.companyId;
      const { limit = 10 } = req.query;
      const notifications =
        await NotificationService.getRecentCompanyNotifications(
          companyId,
          limit
        );

      console.log(notifications);

      res.json(notifications);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  async searchNotifications(req, res) {
    try {
      const { query } = req.query;
      const { page = 1, limit = 10 } = req.query;
      const result = await NotificationService.searchNotifications(query, {
        page,
        limit,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getNotificationsByType(req, res) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const result = await NotificationService.getNotificationsByType(type, {
        page,
        limit,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getNotificationTypes(req, res) {
    try {
      res.json(NotificationType);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new NotificationController();
