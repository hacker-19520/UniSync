const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../database');
const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities, createdAt 
       FROM users WHERE id = $1`,
      [req.userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/me', authMiddleware, async (req, res) => {
  const { name, university, department, course, shift, section, semester, image, reason, qualities } = req.body;
  try {
    await pool.query(
      `UPDATE users SET name = $1, university = $2, department = $3, course = $4, shift = $5, section = $6, semester = $7, image = $8, reason = $9, qualities = $10 WHERE id = $11`,
      [name, university, department, course, shift, section, semester, image, reason, qualities, req.userId]
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for finding matches) - exclude current user
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { rows: users } = await pool.query(
      `SELECT id, name, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities 
       FROM users 
       WHERE id != $1 AND isVerified = 1 AND university = (SELECT university FROM users WHERE id = $1)
       ORDER BY createdAt DESC`,
      [req.userId]
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
