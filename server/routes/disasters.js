import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";

const router = express.Router();

// Endpoint to add a disaster
router.post('/disasters', asyncHandler(async (req, res) => {
  const { disasterType, disasterDate } = req.body;

  if (!disasterType) {
    return res.status(400).json({ message: 'Disaster type is required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO disaster (disasterType, disasterDate) VALUES (?, ?)',
      [disasterType, disasterDate]
    );

    res.status(201).json({
      id: result.insertId,
      disasterType,
      disasterDate
    });
  } catch (error) {
    console.error('Error adding disaster:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Endpoint to get all disasters
router.get('/disasters', asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM disaster');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching disasters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));


// Endpoint to link family to disaster
router.post('/affected_family', asyncHandler(async (req, res) => {
  const { familyId, disasterId } = req.body;

  if (!familyId || !disasterId) {
    return res.status(400).json({ message: 'Family ID and Disaster ID are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO affected_family (familyId, disasterId) VALUES (?, ?)',
      [familyId, disasterId]
    );

    res.status(201).json({
      id: result.insertId,
      familyId,
      disasterId
    });
  } catch (error) {
    console.error('Error linking family to disaster:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Endpoint to get all families linked to any disaster
router.get('/families_with_disasters', asyncHandler(async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT f.id AS familyId, f.representative, a.disasterId, d.disasterType,  d.disasterDate, a.id
      FROM affected_family a
      JOIN family f ON a.familyId = f.id
      JOIN disaster d ON a.disasterId = d.id
    `);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No families linked to disasters found.' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching families with disasters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Endpoint to get disaster counts with dates
router.get('/disasters/count', asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT disasterType, COUNT(*) as count, DATE(disasterDate) as disasterDate
      FROM disaster
      GROUP BY disasterType, DATE(disasterDate)
      ORDER BY DATE(disasterDate) DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching disaster counts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Route to get the total number of affected families
router.get("/affectedFamilies", async (req, res) => {
  try {
    const [affectedFamilies] = await db.query(`
      SELECT COUNT(DISTINCT familyId) AS total FROM affected_family
    `);

    res.status(200).json({ total: affectedFamilies[0].total });
  } catch (error) {
    console.error("Error fetching affected families:", error);
    res.status(500).json({ message: "Error fetching affected families" });
  }
});

// Endpoint to count affected families by disaster ID
router.get('/affectedFamilies/count/:disasterId', asyncHandler(async (req, res) => {
  const { disasterId } = req.params;

  try {
    const [summaryRows] = await db.query(`
          SELECT 
      COUNT(DISTINCT f.id) AS familyCount,

      -- Count total males and females across both representative and members
      (COUNT(CASE WHEN f.gender = 'Male' THEN 1 END) + COUNT(CASE WHEN fm.gender = 'Male' THEN 1 END)) AS totalMaleMembers,
      (COUNT(CASE WHEN f.gender = 'Female' THEN 1 END) + COUNT(CASE WHEN fm.gender = 'Female' THEN 1 END)) AS totalFemaleMembers,

      -- Children counts
      SUM(CASE WHEN (f.gender = 'Male' AND f.age BETWEEN 0 AND 12) OR (fm.gender = 'Male' AND fm.age BETWEEN 0 AND 12) THEN 1 ELSE 0 END) AS maleChildren,
      SUM(CASE WHEN (f.gender = 'Female' AND f.age BETWEEN 0 AND 12) OR (fm.gender = 'Female' AND fm.age BETWEEN 0 AND 12) THEN 1 ELSE 0 END) AS femaleChildren,

      -- Teens counts
      SUM(CASE WHEN (f.gender = 'Male' AND f.age BETWEEN 13 AND 19) OR (fm.gender = 'Male' AND fm.age BETWEEN 13 AND 19) THEN 1 ELSE 0 END) AS maleTeens,
      SUM(CASE WHEN (f.gender = 'Female' AND f.age BETWEEN 13 AND 19) OR (fm.gender = 'Female' AND fm.age BETWEEN 13 AND 19) THEN 1 ELSE 0 END) AS femaleTeens,

      -- Adults counts
      SUM(CASE WHEN (f.gender = 'Male' AND f.age BETWEEN 20 AND 59) OR (fm.gender = 'Male' AND fm.age BETWEEN 20 AND 59) THEN 1 ELSE 0 END) AS maleAdults,
      SUM(CASE WHEN (f.gender = 'Female' AND f.age BETWEEN 20 AND 59) OR (fm.gender = 'Female' AND fm.age BETWEEN 20 AND 59) THEN 1 ELSE 0 END) AS femaleAdults,

      -- Seniors counts
      SUM(CASE WHEN (f.gender = 'Male' AND f.age >= 60) OR (fm.gender = 'Male' AND fm.age >= 60) THEN 1 ELSE 0 END) AS maleSeniors,
      SUM(CASE WHEN (f.gender = 'Female' AND f.age >= 60) OR (fm.gender = 'Female' AND fm.age >= 60) THEN 1 ELSE 0 END) AS femaleSeniors

    FROM affected_family af
    JOIN family f ON af.familyId = f.id
    LEFT JOIN family_member fm ON f.id = fm.familyId
    WHERE af.disasterId = ?;

    `, [disasterId]);

    if (summaryRows.length === 0) {
      return res.status(404).json({ message: 'No affected families found for this disaster.' });
    }

    res.status(200).json({
      familyCount: parseInt(summaryRows[0].familyCount, 10),
      totalMaleMembers: parseInt(summaryRows[0].totalMaleMembers, 10),
      totalFemaleMembers: parseInt(summaryRows[0].totalFemaleMembers, 10),
      summary: {
        children: { males: parseInt(summaryRows[0].maleChildren, 10), females: parseInt(summaryRows[0].femaleChildren, 10) },
        teens: { males: parseInt(summaryRows[0].maleTeens, 10), females: parseInt(summaryRows[0].femaleTeens, 10) },
        adults: { males: parseInt(summaryRows[0].maleAdults, 10), females: parseInt(summaryRows[0].femaleAdults, 10) },
        seniors: { males: parseInt(summaryRows[0].maleSeniors, 10), females: parseInt(summaryRows[0].femaleSeniors, 10) }
      }
    });

  } catch (error) {
    console.error('Error fetching affected families count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));



// Endpoint to get detailed affected families data by disaster ID
router.get('/affectedFamilies/details/:disasterId', asyncHandler(async (req, res) => {
  const { disasterId } = req.params;

  try {
    // Query to get family and family member details by disasterId
    const [familyRows] = await db.query(`
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
      FROM affected_family af
      JOIN family f ON af.familyId = f.id
      LEFT JOIN family_member fm ON fm.familyId = f.id
      WHERE af.disasterId = ?;
    `, [disasterId]);

    if (familyRows.length === 0) {
      return res.status(404).json({ message: 'No affected families found for this disaster.' });
    }

    // Group family members by family ID
    const families = {};

    familyRows.forEach(row => {
      const { family_id, representative, residencyType, ownerName, family_age, family_gender, family_birth_date, family_status, family_phone, purok, member_id, ...memberDetails } = row;

      if (!families[family_id]) {
        families[family_id] = {
          familyId: family_id,
          representative,
          residencyType,
          ownerName,
          age: family_age,
          gender: family_gender,
          birthDate: family_birth_date,
          status: family_status,
          phone: family_phone,
          purok,
          members: [],
        };
      }

      // Only push member details if they exist
      if (member_id) {
        families[family_id].members.push({
          memberId: member_id,
          name: memberDetails.member_name,
          age: memberDetails.member_age,
          gender: memberDetails.member_gender,
          status: memberDetails.member_status,
          birthDate: memberDetails.member_birth_date,
          phone: memberDetails.member_phone,
          image: memberDetails.member_image,
        });
      }
    });

    // Convert families object to an array
    const familyDetailsArray = Object.values(families);


    res.status(200).json({
      affectedFamilies: familyDetailsArray,
    });
  } catch (error) {
    console.error('Error fetching affected families details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));

// Endpoint to count affected families by disaster type
router.get('/affectedFamilies/count/type/:disasterType', asyncHandler(async (req, res) => {
  const { disasterType } = req.params;

  try {
    const [summaryRows] = await db.query(`
      SELECT 
        COUNT(DISTINCT f.id) AS familyCount,

        -- Count total males and females across both representative and members
        (COUNT(CASE WHEN f.gender = 'Male' THEN 1 END) + COUNT(CASE WHEN fm.gender = 'Male' THEN 1 END)) AS totalMaleMembers,
        (COUNT(CASE WHEN f.gender = 'Female' THEN 1 END) + COUNT(CASE WHEN fm.gender = 'Female' THEN 1 END)) AS totalFemaleMembers,

        -- Children counts
        SUM(CASE WHEN (f.gender = 'Male' AND f.age BETWEEN 0 AND 12) OR (fm.gender = 'Male' AND fm.age BETWEEN 0 AND 12) THEN 1 ELSE 0 END) AS maleChildren,
        SUM(CASE WHEN (f.gender = 'Female' AND f.age BETWEEN 0 AND 12) OR (fm.gender = 'Female' AND fm.age BETWEEN 0 AND 12) THEN 1 ELSE 0 END) AS femaleChildren,

        -- Teens counts
        SUM(CASE WHEN (f.gender = 'Male' AND f.age BETWEEN 13 AND 19) OR (fm.gender = 'Male' AND fm.age BETWEEN 13 AND 19) THEN 1 ELSE 0 END) AS maleTeens,
        SUM(CASE WHEN (f.gender = 'Female' AND f.age BETWEEN 13 AND 19) OR (fm.gender = 'Female' AND fm.age BETWEEN 13 AND 19) THEN 1 ELSE 0 END) AS femaleTeens,

        -- Adults counts
        SUM(CASE WHEN (f.gender = 'Male' AND f.age BETWEEN 20 AND 59) OR (fm.gender = 'Male' AND fm.age BETWEEN 20 AND 59) THEN 1 ELSE 0 END) AS maleAdults,
        SUM(CASE WHEN (f.gender = 'Female' AND f.age BETWEEN 20 AND 59) OR (fm.gender = 'Female' AND fm.age BETWEEN 20 AND 59) THEN 1 ELSE 0 END) AS femaleAdults,

        -- Seniors counts
        SUM(CASE WHEN (f.gender = 'Male' AND f.age >= 60) OR (fm.gender = 'Male' AND fm.age >= 60) THEN 1 ELSE 0 END) AS maleSeniors,
        SUM(CASE WHEN (f.gender = 'Female' AND f.age >= 60) OR (fm.gender = 'Female' AND fm.age >= 60) THEN 1 ELSE 0 END) AS femaleSeniors

      FROM affected_family af
      JOIN family f ON af.familyId = f.id
      LEFT JOIN family_member fm ON f.id = fm.familyId
      JOIN disaster d ON af.disasterId = d.id
      WHERE d.disasterType = ?;
    `, [disasterType]);

    if (summaryRows.length === 0) {
      return res.status(404).json({ message: 'No affected families found for this disaster type.' });
    }

    res.status(200).json({
      familyCount: parseInt(summaryRows[0].familyCount, 10),
      totalMaleMembers: parseInt(summaryRows[0].totalMaleMembers, 10),
      totalFemaleMembers: parseInt(summaryRows[0].totalFemaleMembers, 10),
      summary: {
        children: { males: parseInt(summaryRows[0].maleChildren, 10), females: parseInt(summaryRows[0].femaleChildren, 10) },
        teens: { males: parseInt(summaryRows[0].maleTeens, 10), females: parseInt(summaryRows[0].femaleTeens, 10) },
        adults: { males: parseInt(summaryRows[0].maleAdults, 10), females: parseInt(summaryRows[0].femaleAdults, 10) },
        seniors: { males: parseInt(summaryRows[0].maleSeniors, 10), females: parseInt(summaryRows[0].femaleSeniors, 10) }
      }
    });

  } catch (error) {
    console.error('Error fetching affected families count by disaster type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}));








export default router;
