import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import sql from '../../database.js';
const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, name, email, "rollNo", "sapId", university, department, course, shift, section, semester, image, reason, qualities, "createdAt" 
      FROM users WHERE id = ${req.userId}
    `;
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
    await sql`
      UPDATE users SET 
        name = ${name}, 
        university = ${university}, 
        department = ${department}, 
        course = ${course}, 
        shift = ${shift}, 
        section = ${section}, 
        semester = ${semester}, 
        image = ${image}, 
        reason = ${reason}, 
        qualities = ${qualities} 
      WHERE id = ${req.userId}
    `;
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for finding matches) - exclude current user
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await sql`
      SELECT id, name, "rollNo", "sapId", university, department, course, shift, section, semester, image, reason, qualities 
      FROM users 
      WHERE id != ${req.userId} AND "isVerified" = 1 AND university = (SELECT university FROM users WHERE id = ${req.userId})
      ORDER BY "createdAt" DESC
    `;
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

