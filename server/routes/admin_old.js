const express = require('express');
const { db } = require('../database');
const router = express.Router();

// Admin middleware - check if user is admin
function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const jwt = require('jsonwebtoken');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unisync-secret-key');
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    req.userId = decoded.userId;
    req.isAdmin = true;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// Get all statistics
router.get('/stats', adminMiddleware, (req, res) => {
  db.get(`SELECT COUNT(*) as totalUsers FROM users`, [], (err, userCount) => {
    if (err) return res.status(500).json({ error: err.message });

    db.get(`SELECT COUNT(*) as verifiedUsers FROM users WHERE isVerified = 1`, [], (err, verifiedCount) => {
      if (err) return res.status(500).json({ error: err.message });

      db.get(`SELECT COUNT(*) as totalRequests FROM requests`, [], (err, requestCount) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get(`SELECT COUNT(*) as totalMessages FROM messages`, [], (err, messageCount) => {
          if (err) return res.status(500).json({ error: err.message });

          db.all(`SELECT university, COUNT(*) as count FROM users GROUP BY university ORDER BY count DESC`, [], (err, universities) => {
            if (err) return res.status(500).json({ error: err.message });

            db.all(`SELECT department, COUNT(*) as count FROM users GROUP BY department ORDER BY count DESC`, [], (err, departments) => {
              if (err) return res.status(500).json({ error: err.message });

              res.json({
                totalUsers: userCount.totalUsers,
                verifiedUsers: verifiedCount.verifiedUsers,
                totalRequests: requestCount.totalRequests,
                totalMessages: messageCount.totalMessages,
                universityBreakdown: universities,
                departmentBreakdown: departments,
              });
            });
          });
        });
      });
    });
  });
});

// Get all users
router.get('/users', adminMiddleware, (req, res) => {
  db.all(
    `SELECT id, name, email, rollNo, sapId, university, department, course, shift, section, reason, qualities, isVerified, isAdmin, createdAt 
     FROM users ORDER BY createdAt DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ users: rows });
    }
  );
});

// Get all connection requests with user details
router.get('/requests', adminMiddleware, (req, res) => {
  db.all(
    `SELECT r.*, 
      s.name as senderName, s.email as senderEmail, s.university as senderUniversity, s.department as senderDepartment,
      rec.name as receiverName, rec.email as receiverEmail, rec.university as receiverUniversity, rec.department as receiverDepartment
     FROM requests r
     JOIN users s ON r.senderId = s.id
     JOIN users rec ON r.receiverId = rec.id
     ORDER BY r.createdAt DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ requests: rows });
    }
  );
});

// Get all messages with user details
router.get('/messages', adminMiddleware, (req, res) => {
  db.all(
    `SELECT m.*, u.name as senderName, u.email as senderEmail
     FROM messages m
     JOIN users u ON m.senderId = u.id
     ORDER BY m.createdAt DESC
     LIMIT 500`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messages: rows });
    }
  );
});

// Delete a user
router.delete('/users/:id', adminMiddleware, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User ${id} deleted successfully.` });
  });
});

// Verify a user manually
router.post('/users/:id/verify', adminMiddleware, (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE users SET isVerified = 1 WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User ${id} verified successfully.` });
  });
});

// Make user admin
router.post('/users/:id/admin', adminMiddleware, (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE users SET isAdmin = 1 WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User ${id} promoted to admin.` });
  });
});

module.exports = router;

