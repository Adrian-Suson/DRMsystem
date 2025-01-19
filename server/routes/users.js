import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";
import upload from '../config/multerConfig.js';

const router = express.Router();

router.post(
  "/users",
  upload.single("profile_picture"),
  asyncHandler(async (req, res) => {
    const { username, password, name, role } = req.body;
    let profile_picture = null;

    if (req.file) {
      profile_picture = req.file.filename;
    }

    console.log('File:', req.file); // Debug logging
    console.log('Body:', req.body); // Debug logging

    try {
      const [result] = await db.query(
        "INSERT INTO users (username, password, name, profile_picture, role) VALUES (?, ?, ?, ?, ?)",
        [username, password, name, profile_picture, role]
      );

      res.status(201).json({
        id: result.insertId,
        username,
        name,
        profile_picture,
        role
      });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to get all users
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      const [users] = await db.query("SELECT * FROM users");
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to update a user
router.put(
  "/users/:id",
  upload.single("profile_picture"),
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const updates = { ...req.body };

    if (req.file) {
      updates.profile_picture = req.file.filename;
    }

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updates), userId];

    try {
      const [result] = await db.query(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        message: "User updated successfully",
        profile_picture: req.file ? req.file.filename : undefined,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to delete a user
router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    try {
      const [result] = await db.query("DELETE FROM users WHERE id = ?", [
        userId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to fetch a user by ID
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
        userId,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to login a user
router.post(
  "/users/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    try {
      // Check if the user exists and the password matches
      const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      // Respond with the user data
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

export default router;
