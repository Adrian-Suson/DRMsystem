import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";

const router = express.Router();

// Endpoint to add a family
router.post(
  "/families",
  asyncHandler(async (req, res) => {
    const {
      representative,
      purok,
      age,
      gender,
      status,
      birthDate,
      phone,
      residencyType,
      ownerName,
    } = req.body;

    // Validate required fields
    if (!representative) {
      return res
        .status(400)
        .json({ message: "Representative name is required." });
    }

    if (!residencyType) {
      return res.status(400).json({ message: "Residency type is required." });
    }

    // Validate residencyType and ownerName logic
    if (residencyType === "Boarder" && !ownerName) {
      return res
        .status(400)
        .json({ message: "Owner name is required for Boarders." });
    }

    if (residencyType === "Resident" && ownerName) {
      return res
        .status(400)
        .json({ message: "Owner name must be null for Residents." });
    }

    try {
      // Insert data into the family table
      const [result] = await db.query(
        "INSERT INTO family (representative, purok, age, gender, status, birthDate, phone, residencyType, ownerName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          representative,
          purok,
          age,
          gender,
          status,
          birthDate,
          phone,
          residencyType,
          ownerName,
        ]
      );

      // Respond with the newly created record
      res.status(201).json({
        id: result.insertId,
        representative,
        purok,
        age,
        gender,
        status,
        birthDate,
        phone,
        residencyType,
        ownerName,
      });
    } catch (error) {
      console.error("Error adding family:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to get all families
router.get(
  "/families",
  asyncHandler(async (req, res) => {
    try {
      const [families] = await db.query("SELECT * FROM family");
      res.status(200).json(families);
    } catch (error) {
      console.error("Error fetching families:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to update a family
router.put(
  "/families/:id",
  asyncHandler(async (req, res) => {
    const familyId = req.params.id;
    const { representative, purok, age, gender, status, birthDate, phone } =
      req.body;

    try {
      const [result] = await db.query(
        "UPDATE family SET representative = ?, purok = ?, age = ?, gender = ?, status = ?, birthDate = ?, phone = ? WHERE id = ?",
        [representative, purok, age, gender, status, birthDate, phone, familyId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Family not found." });
      }

      res.status(200).json({ message: "Family updated successfully." });
    } catch (error) {
      console.error("Error updating family:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to delete a family
router.delete(
  "/families/:id",
  asyncHandler(async (req, res) => {
    const familyId = req.params.id;

    try {
      const [result] = await db.query("DELETE FROM family WHERE id = ?", [
        familyId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Family not found." });
      }

      res.status(200).json({ message: "Family deleted successfully." });
    } catch (error) {
      console.error("Error deleting family:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Endpoint to fetch a family by ID
router.get(
  "/families/:id",
  asyncHandler(async (req, res) => {
    const familyId = req.params.id;

    try {
      const [rows] = await db.query("SELECT * FROM family WHERE id = ?", [
        familyId,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Family not found." });
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      console.error("Error fetching family:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

router.get(
  "/population",
  asyncHandler(async (req, res) => {
    // First, count male/female representatives from the family table
    const [familyData] = await db.query(`
      SELECT
          f.purok,
          SUM(CASE WHEN f.gender = 'Male' THEN 1 ELSE 0 END) AS male_family_representative,
          SUM(CASE WHEN f.gender = 'Female' THEN 1 ELSE 0 END) AS female_family_representative
      FROM
          family f
      GROUP BY 
          f.purok
    `);

    // Second, count male/female members from the family_member table, grouped by purok
    const [memberData] = await db.query(`
      SELECT
          f.purok,
          SUM(CASE WHEN fm.gender = 'Male' THEN 1 ELSE 0 END) AS male_family_member,
          SUM(CASE WHEN fm.gender = 'Female' THEN 1 ELSE 0 END) AS female_family_member
      FROM
          family_member fm
      JOIN
          family f ON fm.familyId = f.id  -- Join the family_member table with the family table
      GROUP BY
          f.purok
    `);

    // Combine the results by matching the purok and adding the counts
    const population = familyData.map((familyRow) => { 
      const familyMembers = memberData.find(
        (memberRow) => memberRow.purok === familyRow.purok
      ) || { male_family_member: 0, female_family_member: 0 };

      return {
        purok: familyRow.purok,
        male:
          Number(familyRow.male_family_representative) +
          Number(familyMembers.male_family_member),
        female:
          Number(familyRow.female_family_representative) +
          Number(familyMembers.female_family_member),
      };
    });

    res.status(200).json({ population });
  })
);

// Endpoint to get affected families count by disaster type
router.get(
  "/affectedFamiliesByType",
  asyncHandler(async (req, res) => {
    try {
      // Query to get the count of affected families grouped by disaster type
      const [results] = await db.query(`
      SELECT 
        d.disasterType,
        COUNT(DISTINCT af.familyId) AS total
      FROM 
        affected_family af
      JOIN 
        disaster d ON af.disasterId = d.id
      GROUP BY 
        d.disasterType
      ORDER BY 
        total DESC
    `);

      // Format the response with disasterType and affected families count
      const affectedFamiliesByType = results.map((row) => ({
        disasterType: row.disasterType,
        total: row.total,
      }));

      res.status(200).json(affectedFamiliesByType);
    } catch (error) {
      console.error("Error fetching affected families by type:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// New endpoint to fetch a specific family by its ID with their members
router.get(
  "/families-with-members/:id",
  asyncHandler(async (req, res) => {
    const familyId = req.params.id; // Get family ID from request parameters

    try {
      const [familiesWithMembers] = await db.query(
        `
      SELECT
          f.id AS family_id,
          f.representative,
          f.residencyType,
          f.ownerName,
          f.age AS family_age,
          f.gender AS family_gender,
          f.birthDate AS family_birth_date,
          f.status AS family_status,
          f.purok,
          f.phone AS family_phone,
          fm.id AS member_id,
          fm.name AS member_name,
          fm.age AS member_age,
          fm.gender AS member_gender,
          fm.status AS member_status,
          fm.birthDate AS member_birth_date,
          fm.phone AS member_phone,
          fm.image AS member_image
      FROM
          family f
      LEFT JOIN
          family_member fm ON f.id = fm.familyId
      WHERE
          f.id = ?  -- Filter by family ID
      ORDER BY
          f.id, fm.id
    `,
        [familyId]
      ); // Pass family ID as a parameter to prevent SQL injection

      if (familiesWithMembers.length === 0) {
        return res.status(404).json({ message: "Family not found" });
      }

      res.status(200).json(familiesWithMembers);
    } catch (error) {
      console.error("Error fetching families with members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

export default router;
