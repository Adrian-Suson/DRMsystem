import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";
import upload from "../config/multerConfig.js"; // Multer config for file uploads

const router = express.Router();

/**
 * 🚀 CREATE: Add a new logo, title, and background
 */
router.post(
  "/logos",
  upload.fields([{ name: "logo" }, { name: "loginBackground" }]),
  asyncHandler(async (req, res) => {
    const { titleText, description, fileFormat } = req.body;
    let logo = null;
    let loginBackground = null;

    if (req.files["logo"]) {
      logo = req.files["logo"][0].buffer.toString("base64");
    }
    if (req.files["loginBackground"]) {
      loginBackground =
        req.files["loginBackground"][0].buffer.toString("base64");
    }

    try {
      const [result] = await db.query(
        "INSERT INTO DynamicLogoAndTitle (Logo, TitleText, Description, FileFormat, LoginBackground) VALUES (?, ?, ?, ?, ?)",
        [logo, titleText, description, fileFormat, loginBackground]
      );

      res.status(201).json({
        id: result.insertId,
        titleText,
        description,
        fileFormat,
        logo,
        loginBackground,
        status: "active",
      });
    } catch (error) {
      console.error("Error adding logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

/**
 * 📄 READ: Fetch all active logos and titles
 */
router.get(
  "/logos",
  asyncHandler(async (req, res) => {
    try {
      const [logos] = await db.query(
        "SELECT * FROM DynamicLogoAndTitle WHERE status = 'active'"
      );

      const formattedLogos = logos.map((logo) => ({
        ...logo,
        Logo: logo.Logo ? logo.Logo.toString("base64") : null,
        LoginBackground: logo.LoginBackground
          ? logo.LoginBackground.toString("base64")
          : null,
      }));

      res.status(200).json(formattedLogos);
    } catch (error) {
      console.error("Error fetching logos:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

/**
 * 📄 READ: Fetch a specific logo by ID
 */
router.get(
  "/logos/:id",
  asyncHandler(async (req, res) => {
    const logoId = req.params.id;

    try {
      const [rows] = await db.query(
        "SELECT * FROM DynamicLogoAndTitle WHERE VersionID = ? AND status = 'active'",
        [logoId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Logo not found or inactive." });
      }

      const logo = {
        ...rows[0],
        Logo: rows[0].Logo ? rows[0].Logo.toString("base64") : null,
        LoginBackground: rows[0].LoginBackground
          ? rows[0].LoginBackground.toString("base64")
          : null,
      };

      res.status(200).json(logo);
    } catch (error) {
      console.error("Error fetching logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

/**
 * 🛠️ UPDATE: Modify an existing logo, title, and background
 */
router.put(
  "/logos/:id",
  upload.fields([{ name: "logo" }, { name: "loginBackground" }]),
  asyncHandler(async (req, res) => {
    const logoId = req.params.id;
    const { titleText, description, fileFormat } = req.body;
    let logo = null;
    let loginBackground = null;

    if (req.files["logo"]) {
      logo = req.files["logo"][0].buffer.toString("base64");
    }
    if (req.files["loginBackground"]) {
      loginBackground =
        req.files["loginBackground"][0].buffer.toString("base64");
    }

    try {
      const updates = [];
      const values = [];

      if (titleText) {
        updates.push("TitleText = ?");
        values.push(titleText);
      }
      if (description) {
        updates.push("Description = ?");
        values.push(description);
      }
      if (fileFormat) {
        updates.push("FileFormat = ?");
        values.push(fileFormat);
      }
      if (logo) {
        updates.push("Logo = ?");
        values.push(logo);
      }
      if (loginBackground) {
        updates.push("LoginBackground = ?");
        values.push(loginBackground);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: "No updates provided." });
      }

      values.push(logoId);

      const [result] = await db.query(
        `UPDATE DynamicLogoAndTitle SET ${updates.join(
          ", "
        )} WHERE VersionID = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Logo not found." });
      }

      res.status(200).json({
        message: "Logo updated successfully",
        logo,
        loginBackground,
      });
    } catch (error) {
      console.error("Error updating logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

/**
 * ❌ DELETE: Soft delete a logo (sets `status` to inactive)
 */
router.delete(
  "/logos/:id",
  asyncHandler(async (req, res) => {
    const logoId = req.params.id;

    try {
      const [result] = await db.query(
        "UPDATE DynamicLogoAndTitle SET status = 'inactive' WHERE VersionID = ?",
        [logoId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Logo not found or already inactive." });
      }

      res.status(200).json({ message: "Logo marked as inactive." });
    } catch (error) {
      console.error("Error deleting logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

export default router;
