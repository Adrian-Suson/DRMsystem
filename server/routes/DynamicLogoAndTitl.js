import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";
import upload from "../config/multerConfig.js"; // Ensure multer is configured for file uploads

const router = express.Router();

// Endpoint to create a new logo and title
router.post(
  "/logos",
  upload.single("logo"), // Multer middleware for handling file uploads
  asyncHandler(async (req, res) => {
    const { titleText, description, fileFormat } = req.body;
    let logoBlob = null;

    // If a file is uploaded, convert it to a Base64 string
    if (req.file) {
      logoBlob = req.file.buffer; // Multer stores the file buffer in `req.file.buffer`
    }

    try {
      const [result] = await db.query(
        "INSERT INTO DynamicLogoAndTitle (LogoBlob, TitleText, Description, FileFormat) VALUES (?, ?, ?, ?)",
        [logoBlob, titleText, description, fileFormat]
      );

      res.status(201).json({
        id: result.insertId,
        titleText,
        description,
        fileFormat,
        logoBlob: logoBlob ? logoBlob.toString("base64") : null, // Return Base64 string for the client
      });
    } catch (error) {
      console.error("Error adding logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to get all logos and titles
router.get(
  "/logos",
  asyncHandler(async (req, res) => {
    try {
      const [logos] = await db.query("SELECT * FROM DynamicLogoAndTitle");

      // Convert LogoBlob to Base64 for each logo
      const formattedLogos = logos.map((logo) => ({
        ...logo,
        LogoBlob: logo.LogoBlob ? logo.LogoBlob.toString("base64") : null,
      }));

      res.status(200).json(formattedLogos);
    } catch (error) {
      console.error("Error fetching logos:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to update a logo and title
router.put(
  "/logos/:id",
  upload.single("logo"), // Multer middleware for file uploads
  asyncHandler(async (req, res) => {
    const logoId = req.params.id;
    const { titleText, description, fileFormat } = req.body;
    let logoBlob = null;

    // Debug: Log incoming request data
    console.log("Request Body:", req.body);
    if (req.file) {
      console.log("Uploaded File:", req.file);
      logoBlob = req.file.buffer;
    } else {
      console.log("No file uploaded.");
    }

    try {
      // Dynamically build SQL query
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
      if (logoBlob) {
        updates.push("LogoBlob = ?");
        values.push(logoBlob);
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
        logoBlob: logoBlob ? logoBlob.toString("base64") : null,
      });
    } catch (error) {
      console.error("Error updating logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to delete a logo and title
router.delete(
  "/logos/:id",
  asyncHandler(async (req, res) => {
    const logoId = req.params.id;

    try {
      const [result] = await db.query(
        "DELETE FROM DynamicLogoAndTitle WHERE VersionID = ?",
        [logoId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Logo not found." });
      }

      res.status(200).json({ message: "Logo deleted successfully." });
    } catch (error) {
      console.error("Error deleting logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to fetch a logo and title by ID
router.get(
  "/logos/:id",
  asyncHandler(async (req, res) => {
    const logoId = req.params.id;

    try {
      const [rows] = await db.query(
        "SELECT * FROM DynamicLogoAndTitle WHERE VersionID = ?",
        [logoId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Logo not found." });
      }

      // Convert LogoBlob to Base64
      const logo = {
        ...rows[0],
        LogoBlob: rows[0].LogoBlob ? rows[0].LogoBlob.toString("base64") : null,
      };

      res.status(200).json(logo);
    } catch (error) {
      console.error("Error fetching logo:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

export default router;
