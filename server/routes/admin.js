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

              db.get(`SELECT COUNT(*) as pendingApprovals FROM users WHERE approvalStatus = 'pending'`, [], (err, pendingCount) => {
                if (err) return res.status(500).json({ error: err.message });

                res.json({
                  totalUsers: userCount.totalUsers,
                  verifiedUsers: verifiedCount.verifiedUsers,
                  totalRequests: requestCount.totalRequests,
                  totalMessages: messageCount.totalMessages,
                  pendingApprovals: pendingCount.pendingApprovals,
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
});

// Get all users
router.get('/users', adminMiddleware, (req, res) => {
  db.all(
    `SELECT id, name, email, rollNo, sapId, university, department, course, shift, section, semester, image, reason, qualities, isVerified, isAdmin, approvalStatus, rejectionReason, createdAt 
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
      s.course as senderCourse, s.image as senderImage, s.qualities as senderQualities, s.rollNo as senderRollNo, s.sapId as senderSapId, s.semester as senderSemester,
      rec.name as receiverName, rec.email as receiverEmail, rec.university as receiverUniversity, rec.department as receiverDepartment,
      rec.course as receiverCourse, rec.image as receiverImage, rec.qualities as receiverQualities, rec.rollNo as receiverRollNo, rec.sapId as receiverSapId, rec.semester as receiverSemester
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

// Get all messages with user details - summarized by conversation
router.get('/messages', adminMiddleware, (req, res) => {
  // First get message summaries grouped by conversation (requestId)
  db.all(
    `SELECT 
      m.requestId,
      COUNT(*) as messageCount,
      MAX(m.createdAt) as lastMessageAt,
      s.name as senderName, s.email as senderEmail, req.senderId as senderId, s.image as senderImage, s.university as senderUniversity, s.department as senderDepartment,
      r.name as receiverName, r.email as receiverEmail, req.receiverId as receiverId, r.image as receiverImage, r.university as receiverUniversity, r.department as receiverDepartment
     FROM messages m
     JOIN requests req ON m.requestId = req.id
     LEFT JOIN users s ON req.senderId = s.id
     LEFT JOIN users r ON req.receiverId = r.id
     GROUP BY m.requestId
     ORDER BY lastMessageAt DESC
     LIMIT 200`,
    [],
    (err, summaries) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messageSummaries: summaries });
    }
  );
});

// Get detailed messages for a specific conversation
router.get('/messages/:requestId', adminMiddleware, (req, res) => {
  const { requestId } = req.params;
  db.all(
    `SELECT 
      m.id, 
      m.requestId, 
      m.senderId, 
      m.content, 
      m.createdAt,
      u.name as senderName, 
      u.email as senderEmail, 
      u.image as senderImage,
      req.senderId as conversationSenderId,
      req.receiverId as conversationReceiverId,
      s.name as conversationSenderName,
      s.image as conversationSenderImage,
      r.name as conversationReceiverName,
      r.image as conversationReceiverImage
     FROM messages m
     LEFT JOIN users u ON m.senderId = u.id
     JOIN requests req ON m.requestId = req.id
     LEFT JOIN users s ON req.senderId = s.id
     LEFT JOIN users r ON req.receiverId = r.id
     WHERE m.requestId = ?
     ORDER BY m.createdAt ASC`,
    [requestId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messages: rows });
    }
  );
});

// Approve a user
router.post('/users/:id/approve', adminMiddleware, (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE users SET approvalStatus = 'approved', rejectionReason = NULL WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User ${id} approved successfully.` });
  });
});

// Reject a user with reason (reason is required)
router.post('/users/:id/reject', adminMiddleware, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Rejection reason is required.' });
  }
  
  db.run(`UPDATE users SET approvalStatus = 'rejected', rejectionReason = ? WHERE id = ?`, [reason.trim(), id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `User ${id} rejected. Reason: ${reason.trim()}` });
  });
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
