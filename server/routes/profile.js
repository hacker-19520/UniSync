const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../database');
const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  db.get(
    `SELECT id, name, email, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities, createdAt 
     FROM users WHERE id = ?`,
    [req.userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ user });
    }
  );
});

// Update profile
router.put('/me', authMiddleware, (req, res) => {
  const { name, university, department, course, shift, section, semester, image, reason, qualities } = req.body;
  
  db.run(
    `UPDATE users SET name = ?, university = ?, department = ?, course = ?, shift = ?, section = ?, semester = ?, image = ?, reason = ?, qualities = ? WHERE id = ?`,
    [name, university, department, course, shift, section, semester, image, reason, qualities, req.userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated successfully.' });
    }
  );
});

// Get all users (for finding matches) - exclude current user
router.get('/users', authMiddleware, (req, res) => {
  db.all(
    `SELECT id, name, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities 
     FROM users 
     WHERE id != ? AND isVerified = 1 AND university = (SELECT university FROM users WHERE id = ?)
     ORDER BY createdAt DESC`,
    [req.userId, req.userId],
    (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ users });
    }
  );
});

module.exports = router;
