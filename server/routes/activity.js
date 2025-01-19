import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";

const router = express.Router();

// Get all activity logs
router.get(
  "/activity-logs",
  asyncHandler(async (req, res) => {
    const { userId, activityType, startDate, endDate } = req.query;
    let query = "SELECT * FROM user_activity_log";
    let params = [];

    // Build query with filters
    if (userId || activityType || startDate || endDate) {
      const conditions = [];
      if (userId) {
        conditions.push("user_id = ?");
        params.push(userId);
      }
      if (activityType) {
        conditions.push("activity_type = ?");
        params.push(activityType);
      }
      if (startDate) {
        conditions.push("timestamp >= ?");
        params.push(startDate);
      }
      if (endDate) {
        conditions.push("timestamp <= ?");
        params.push(endDate);
      }
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY timestamp DESC";

    try {
      const [logs] = await db.query(query, params);
      res.status(200).json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Create new activity log
router.post(
  "/activity-logs",
  asyncHandler(async (req, res) => {
    const { user_id, activity_type, description } = req.body;

    try {
      const [result] = await db.query(
        "INSERT INTO user_activity_log (user_id, activity_type, description) VALUES (?, ?, ?)",
        [user_id, activity_type, description]
      );

      res.status(201).json({
        id: result.insertId,
        user_id,
        activity_type,
        description,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error creating activity log:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Get activity logs by user ID
router.get(
  "/activity-logs/:userId",
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    try {
      const [rows] = await db.query(
        "SELECT * FROM user_activity_log WHERE user_id = ?",
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "No activity logs found for this user" });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Delete activity log
router.delete(
  "/activity-logs/:id",
  asyncHandler(async (req, res) => {
    const logId = req.params.id;

    try {
      const [result] = await db.query(
        "DELETE FROM user_activity_log WHERE id = ?",
        [logId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Activity log not found" });
      }

      res.status(200).json({ message: "Activity log deleted successfully" });
    } catch (error) {
      console.error("Error deleting activity log:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

export default router;