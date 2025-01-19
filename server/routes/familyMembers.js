import express from "express";
import asyncHandler from "../middleware/asyncHandler.js";
import db from "../db.js";

const router = express.Router();

// Utility function for member validation
const validateMemberData = ({ familyId, name, age, gender, status, birthDate }) => {
  return familyId && name && gender && status && birthDate !== undefined;
};

// Endpoint to add a family member
router.post('/familyMembers', asyncHandler(async (req, res) => {
  const { familyId, name, age, gender, status, birthDate, image, phone } = req.body;

  if (!validateMemberData(req.body)) {
    return res.status(400).json({ message: 'All fields except image and phone are required.' });
  }

  const [family] = await db.query('SELECT id FROM family WHERE id = ?', [familyId]);
  if (family.length === 0) {
    return res.status(400).json({ message: 'Invalid familyId: No such family exists.' });
  }

  const [result] = await db.query(
    'INSERT INTO family_member (familyId, name, age, gender, status, image, birthDate, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [familyId, name, age, gender, status, image, birthDate, phone]
  );

  res.status(201).json({
    id: result.insertId,
    familyId,
    name,
    age,
    gender,
    status,
    image,
    birthDate,
    phone
  });
}));

// Endpoint to get all family members
router.get('/familyMembers', asyncHandler(async (req, res) => {
  const [members] = await db.query('SELECT * FROM family_member');
  res.status(200).json(members);
}));

// Endpoint to update a family member
router.put('/familyMembers/:id', asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  const { name, age, gender, status, birthDate, image, phone } = req.body;

  if (!validateMemberData({ familyId: memberId, name, gender, status, birthDate })) {
    return res.status(400).json({ message: 'All fields except image and phone are required.' });
  }

  const [result] = await db.query(
    'UPDATE family_member SET name = ?, age = ?, gender = ?, status = ?, image = ?, birthDate = ?, phone = ? WHERE id = ?',
    [name, age, gender, status, image, birthDate, phone, memberId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Family member not found.' });
  }

  res.status(200).json({ message: 'Family member updated successfully.' });
}));

// Endpoint to delete a family member
router.delete('/familyMembers/:id', asyncHandler(async (req, res) => {
  const memberId = req.params.id;

  const [result] = await db.query('DELETE FROM family_member WHERE id = ?', [memberId]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Family member not found.' });
  }

  res.status(200).json({ message: 'Family member deleted successfully.' });
}));

// Endpoint to get family members by familyId
router.get('/familyMembers/:familyId', asyncHandler(async (req, res) => {
  const { familyId } = req.params;

  if (!familyId) {
    return res.status(400).json({ message: "familyId is required." });
  }

  try {
    const [members] = await db.query("SELECT * FROM family_member WHERE familyId = ?", [familyId]);

    if (members.length === 0) {
      return res.status(404).json({ message: `No family members found for familyId: ${familyId}.` });
    }

    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching family members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}));

export default router;
