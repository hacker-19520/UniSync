const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { db } = require('../database');
const router = express.Router();

// Send a connection request
router.post('/request', authMiddleware, (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  if (!receiverId) return res.status(400).json({ error: 'Receiver ID is required.' });
  if (receiverId == senderId) return res.status(400).json({ error: 'Cannot send request to yourself.' });

  // Check if request already exists
  db.get(
    `SELECT * FROM requests WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)`,
    [senderId, receiverId, receiverId, senderId],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });
      if (existing) return res.status(400).json({ error: 'Request already exists between you and this user.' });

      db.run(
        `INSERT INTO requests (senderId, receiverId, status) VALUES (?, ?, 'pending')`,
        [senderId, receiverId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Request sent successfully.', requestId: this.lastID });
        }
      );
    }
  );
});

// Accept a request
router.post('/accept/:id', authMiddleware, (req, res) => {
  const requestId = req.params.id;
  const userId = req.userId;

  db.get(`SELECT * FROM requests WHERE id = ? AND receiverId = ? AND status = 'pending'`, [requestId, userId], (err, request) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!request) return res.status(404).json({ error: 'Request not found or already processed.' });

    db.run(`UPDATE requests SET status = 'accepted' WHERE id = ?`, [requestId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Request accepted. You can now chat!' });
    });
  });
});

// Reject a request
router.post('/reject/:id', authMiddleware, (req, res) => {
  const requestId = req.params.id;
  const userId = req.userId;

  db.get(`SELECT * FROM requests WHERE id = ? AND receiverId = ? AND status = 'pending'`, [requestId, userId], (err, request) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!request) return res.status(404).json({ error: 'Request not found or already processed.' });

    db.run(`UPDATE requests SET status = 'rejected' WHERE id = ?`, [requestId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Request rejected.' });
    });
  });
});

// Get requests sent by current user
router.get('/my-requests', authMiddleware, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT r.*, u.name, u.university, u.department, u.image 
     FROM requests r
     JOIN users u ON r.receiverId = u.id
     WHERE r.senderId = ?
     ORDER BY r.createdAt DESC`,
    [userId],
    (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ requests });
    }
  );
});

// Get requests received by current user
router.get('/requests-for-me', authMiddleware, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT r.*, u.name, u.university, u.department, u.image 
     FROM requests r
     JOIN users u ON r.senderId = u.id
     WHERE r.receiverId = ? AND r.status = 'pending'
     ORDER BY r.createdAt DESC`,
    [userId],
    (err, requests) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ requests });
    }
  );
});

// Get accepted matches (mutual connections)
router.get('/my-matches', authMiddleware, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT r.*, 
      CASE 
        WHEN r.senderId = ? THEN r.receiverId 
        ELSE r.senderId 
      END as matchId,
      CASE 
        WHEN r.senderId = ? THEN u2.name 
        ELSE u1.name 
      END as matchName,
      CASE 
        WHEN r.senderId = ? THEN u2.university 
        ELSE u1.university 
      END as matchUniversity,
      CASE 
        WHEN r.senderId = ? THEN u2.department 
        ELSE u1.department 
      END as matchDepartment,
      CASE 
        WHEN r.senderId = ? THEN u2.course 
        ELSE u1.course 
      END as matchCourse,
      CASE 
        WHEN r.senderId = ? THEN u2.shift 
        ELSE u1.shift 
      END as matchShift,
      CASE 
        WHEN r.senderId = ? THEN u2.section 
        ELSE u1.section 
      END as matchSection,
      CASE 
        WHEN r.senderId = ? THEN u2.semester 
        ELSE u1.semester 
      END as matchSemester,
      CASE 
        WHEN r.senderId = ? THEN u2.image 
        ELSE u1.image 
      END as matchImage
     FROM requests r
     JOIN users u1 ON r.senderId = u1.id
     JOIN users u2 ON r.receiverId = u2.id
     WHERE (r.senderId = ? OR r.receiverId = ?) AND r.status = 'accepted'
     ORDER BY r.createdAt DESC`,
    [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId],
    (err, matches) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ matches });
    }
  );
});

module.exports = router;
