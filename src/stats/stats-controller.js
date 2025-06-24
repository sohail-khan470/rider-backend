const statsService = require("./stats-service");

class StatsController {
  async getDashboardStats(req, res) {
    try {
      const stats = await statsService.getDashboardStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ success: false, error: "Failed to load stats" });
    }
  }
}

module.exports = new StatsController();
