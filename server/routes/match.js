const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { pool } = require('../database');
const router = express.Router();

// Send a connection request
router.post('/request', authMiddleware, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  if (!receiverId) return res.status(400).json({ error: 'Receiver ID is required.' });
  if (receiverId == senderId) return res.status(400).json({ error: 'Cannot send request to yourself.' });

  try {
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM requests WHERE (senderId = $1 AND receiverId = $2) OR (senderId = $2 AND receiverId = $1)`,
      [senderId, receiverId]
    );
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Request already exists between you and this user.' });
    }

    const result = await pool.query(
      `INSERT INTO requests (senderId, receiverId, status) VALUES ($1, $2, 'pending') RETURNING id`,
      [senderId, receiverId]
    );
    res.status(201).json({ message: 'Request sent successfully.', requestId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a request
router.post('/accept/:id', authMiddleware, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.userId;

  try {
    const { rows } = await pool.query(`SELECT * FROM requests WHERE id = $1 AND receiverId = $2 AND status = 'pending'`, [requestId, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Request not found or already processed.' });

    await pool.query(`UPDATE requests SET status = 'accepted' WHERE id = $1`, [requestId]);
    res.json({ message: 'Request accepted. You can now chat!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject a request
router.post('/reject/:id', authMiddleware, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.userId;

  try {
    const { rows } = await pool.query(`SELECT * FROM requests WHERE id = $1 AND receiverId = $2 AND status = 'pending'`, [requestId, userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Request not found or already processed.' });

    await pool.query(`UPDATE requests SET status = 'rejected' WHERE id = $1`, [requestId]);
    res.json({ message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests sent by current user
router.get('/my-requests', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const { rows: requests } = await pool.query(
      `SELECT r.*, u.name, u.university, u.department, u.image 
       FROM requests r
       JOIN users u ON r.receiverId = u.id
       WHERE r.senderId = $1
       ORDER BY r.createdAt DESC`,
      [userId]
    );
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests received by current user
router.get('/requests-for-me', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const { rows: requests } = await pool.query(
      `SELECT r.*, u.name, u.university, u.department, u.image 
       FROM requests r
       JOIN users u ON r.senderId = u.id
       WHERE r.receiverId = $1 AND r.status = 'pending'
       ORDER BY r.createdAt DESC`,
      [userId]
    );
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get accepted matches (mutual connections)
router.get('/my-matches', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const { rows: matches } = await pool.query(
      `SELECT r.*, 
        CASE 
          WHEN r.senderId = $1 THEN r.receiverId 
          ELSE r.senderId 
        END as matchId,
        CASE 
          WHEN r.senderId = $1 THEN u2.name 
          ELSE u1.name 
        END as matchName,
        CASE 
          WHEN r.senderId = $1 THEN u2.university 
          ELSE u1.university 
        END as matchUniversity,
        CASE 
          WHEN r.senderId = $1 THEN u2.department 
          ELSE u1.department 
        END as matchDepartment,
        CASE 
          WHEN r.senderId = $1 THEN u2.course 
          ELSE u1.course 
        END as matchCourse,
        CASE 
          WHEN r.senderId = $1 THEN u2.shift 
          ELSE u1.shift 
        END as matchShift,
        CASE 
          WHEN r.senderId = $1 THEN u2.section 
          ELSE u1.section 
        END as matchSection,
        CASE 
          WHEN r.senderId = $1 THEN u2.semester 
          ELSE u1.semester 
        END as matchSemester,
        CASE 
          WHEN r.senderId = $1 THEN u2.image 
          ELSE u1.image 
        END as matchImage
       FROM requests r
       JOIN users u1 ON r.senderId = u1.id
       JOIN users u2 ON r.receiverId = u2.id
       WHERE (r.senderId = $1 OR r.receiverId = $1) AND r.status = 'accepted'
       ORDER BY r.createdAt DESC`,
      [userId]
    );
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
