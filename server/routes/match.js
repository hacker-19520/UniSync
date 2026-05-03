import express from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import sql from '../../database.js';
const router = express.Router();

// Send a connection request
router.post('/request', authMiddleware, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  if (!receiverId) return res.status(400).json({ error: 'Receiver ID is required.' });
  if (receiverId == senderId) return res.status(400).json({ error: 'Cannot send request to yourself.' });

  try {
    const existingRows = await sql`
      SELECT * FROM requests WHERE (senderId = ${senderId} AND receiverId = ${receiverId}) OR (senderId = ${receiverId} AND receiverId = ${senderId})
    `;
    if (existingRows.length > 0) {
      return res.status(400).json({ error: 'Request already exists between you and this user.' });
    }

    const [result] = await sql`
      INSERT INTO requests (senderId, receiverId, status) 
      VALUES (${senderId}, ${receiverId}, 'pending') 
      RETURNING id
    `;
    res.status(201).json({ message: 'Request sent successfully.', requestId: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a request
router.post('/accept/:id', authMiddleware, async (req, res) => {
  const requestId = req.params.id;
  const userId = req.userId;

  try {
    const rows = await sql`SELECT * FROM requests WHERE id = ${requestId} AND receiverId = ${userId} AND status = 'pending'`;
    if (rows.length === 0) return res.status(404).json({ error: 'Request not found or already processed.' });

    await sql`UPDATE requests SET status = 'accepted' WHERE id = ${requestId}`;
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
    const rows = await sql`SELECT * FROM requests WHERE id = ${requestId} AND receiverId = ${userId} AND status = 'pending'`;
    if (rows.length === 0) return res.status(404).json({ error: 'Request not found or already processed.' });

    await sql`UPDATE requests SET status = 'rejected' WHERE id = ${requestId}`;
    res.json({ message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests sent by current user
router.get('/my-requests', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const requests = await sql`
      SELECT r.*, u.name, u.university, u.department, u.image 
      FROM requests r
      JOIN users u ON r.receiverId = u.id
      WHERE r.senderId = ${userId}
      ORDER BY r."createdAt" DESC
    `;
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests received by current user
router.get('/requests-for-me', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const requests = await sql`
      SELECT r.*, u.name, u.university, u.department, u.image 
      FROM requests r
      JOIN users u ON r.senderId = u.id
      WHERE r.receiverId = ${userId} AND r.status = 'pending'
      ORDER BY r."createdAt" DESC
    `;
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get accepted matches (mutual connections)
router.get('/my-matches', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const matches = await sql`
      SELECT r.*, 
        CASE 
          WHEN r.senderId = ${userId} THEN r.receiverId 
          ELSE r.senderId 
        END as matchId,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.name 
          ELSE u1.name 
        END as matchName,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.university 
          ELSE u1.university 
        END as matchUniversity,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.department 
          ELSE u1.department 
        END as matchDepartment,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.course 
          ELSE u1.course 
        END as matchCourse,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.shift 
          ELSE u1.shift 
        END as matchShift,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.section 
          ELSE u1.section 
        END as matchSection,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.semester 
          ELSE u1.semester 
        END as matchSemester,
        CASE 
          WHEN r.senderId = ${userId} THEN u2.image 
          ELSE u1.image 
        END as matchImage
      FROM requests r
      JOIN users u1 ON r.senderId = u1.id
      JOIN users u2 ON r.receiverId = u2.id
      WHERE (r.senderId = ${userId} OR r.receiverId = ${userId}) AND r.status = 'accepted'
      ORDER BY r."createdAt" DESC
    `;
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

