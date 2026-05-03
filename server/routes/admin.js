import express from 'express';
import sql from '../../database.js';
const router = express.Router();

// Admin middleware - check if user is admin
function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const jwt = await import('jsonwebtoken');

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
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [userCount] = await sql`SELECT COUNT(*) as totalusers FROM users`;
    const [verifiedCount] = await sql`SELECT COUNT(*) as verifiedusers FROM users WHERE "isVerified" = 1`;
    const [requestCount] = await sql`SELECT COUNT(*) as totalrequests FROM requests`;
    const [messageCount] = await sql`SELECT COUNT(*) as totalmessages FROM messages`;
    const universities = await sql`SELECT university, COUNT(*) as count FROM users GROUP BY university ORDER BY count DESC`;
    const departments = await sql`SELECT department, COUNT(*) as count FROM users GROUP BY department ORDER BY count DESC`;
    const [pendingCount] = await sql`SELECT COUNT(*) as pendingapprovals FROM users WHERE "approvalStatus" = 'pending'`;

    res.json({
      totalUsers: userCount.totalusers,
      verifiedUsers: verifiedCount.verifiedusers,
      totalRequests: requestCount.totalrequests,
      totalMessages: messageCount.totalmessages,
      pendingApprovals: pendingCount.pendingapprovals,
      universityBreakdown: universities,
      departmentBreakdown: departments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, name, email, "rollNo", "sapId", university, department, course, shift, section, semester, image, reason, qualities, "isVerified", "isAdmin", "approvalStatus", "rejectionReason", "createdAt" 
      FROM users ORDER BY "createdAt" DESC
    `;
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all connection requests with user details
router.get('/requests', adminMiddleware, async (req, res) => {
  try {
    const rows = await sql`
      SELECT r.*, 
        s.name as "senderName", s.email as "senderEmail", s.university as "senderUniversity", s.department as "senderDepartment",
        s.course as "senderCourse", s.image as "senderImage", s.qualities as "senderQualities", s."rollNo" as "senderRollNo", s."sapId" as "senderSapId", s.semester as "senderSemester",
        rec.name as "receiverName", rec.email as "receiverEmail", rec.university as "receiverUniversity", rec.department as "receiverDepartment",
        rec.course as "receiverCourse", rec.image as "receiverImage", rec.qualities as "receiverQualities", rec."rollNo" as "receiverRollNo", rec."sapId" as "receiverSapId", rec.semester as "receiverSemester"
      FROM requests r
      JOIN users s ON r.senderId = s.id
      JOIN users rec ON r.receiverId = rec.id
      ORDER BY r."createdAt" DESC
    `;
    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages with user details - summarized by conversation
router.get('/messages', adminMiddleware, async (req, res) => {
  try {
    const summaries = await sql`
      SELECT 
        m.requestId,
        COUNT(*) as messageCount,
        MAX(m."createdAt") as lastMessageAt,
        s.name as "senderName", s.email as "senderEmail", req.senderId as senderId, s.image as "senderImage", s.university as "senderUniversity", s.department as "senderDepartment",
        r.name as "receiverName", r.email as "receiverEmail", req.receiverId as receiverId, r.image as "receiverImage", r.university as "receiverUniversity", r.department as "receiverDepartment"
      FROM messages m
      JOIN requests req ON m.requestId = req.id
      LEFT JOIN users s ON req.senderId = s.id
      LEFT JOIN users r ON req.receiverId = r.id
      GROUP BY m.requestId, req.senderId, req.receiverId, s.name, s.email, s.image, s.university, s.department, r.name, r.email, r.image, r.university, r.department
      ORDER BY lastMessageAt DESC
      LIMIT 200
    `;
    res.json({ messageSummaries: summaries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get detailed messages for a specific conversation
router.get('/messages/:requestId', adminMiddleware, async (req, res) => {
  const { requestId } = req.params;
  try {
    const rows = await sql`
      SELECT 
        m.id, 
        m.requestId, 
        m.senderId, 
        m.content, 
        m."createdAt",
        u.name as "senderName", 
        u.email as "senderEmail", 
        u.image as "senderImage",
        req.senderId as conversationSenderId,
        req.receiverId as conversationReceiverId,
        s.name as "conversationSenderName",
        s.image as "conversationSenderImage",
        r.name as "conversationReceiverName",
        r.image as "conversationReceiverImage"
      FROM messages m
      LEFT JOIN users u ON m.senderId = u.id
      JOIN requests req ON m.requestId = req.id
      LEFT JOIN users s ON req.senderId = s.id
      LEFT JOIN users r ON req.receiverId = r.id
      WHERE m.requestId = ${requestId}
      ORDER BY m."createdAt" ASC
    `;
    res.json({ messages: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a user
router.post('/users/:id/approve', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`UPDATE users SET "approvalStatus" = 'approved', "rejectionReason" = NULL WHERE id = ${id}`;
    res.json({ message: `User ${id} approved successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject a user with reason (reason is required)
router.post('/users/:id/reject', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Rejection reason is required.' });
  }
  
  try {
    await sql`UPDATE users SET "approvalStatus" = 'rejected', "rejectionReason" = ${reason.trim()} WHERE id = ${id}`;
    res.json({ message: `User ${id} rejected. Reason: ${reason.trim()}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM users WHERE id = ${id}`;
    res.json({ message: `User ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify a user manually
router.post('/users/:id/verify', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`UPDATE users SET "isVerified" = 1 WHERE id = ${id}`;
    res.json({ message: `User ${id} verified successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Make user admin
router.post('/users/:id/admin', adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`UPDATE users SET "isAdmin" = 1 WHERE id = ${id}`;
    res.json({ message: `User ${id} promoted to admin.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

