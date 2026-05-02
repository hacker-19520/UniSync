const { pool } = require('../database');

// Express routes for messages
function createMessageRoutes(router, authMiddleware) {
  // Send a message
  router.post('/messages/:requestId', authMiddleware, async (req, res) => {
    const { requestId } = req.params;
    const { content } = req.body;
    const senderId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    try {
      const { rows: requestRows } = await pool.query(
        `SELECT * FROM requests WHERE id = $1 AND status = 'accepted' AND (senderId = $2 OR receiverId = $2)`,
        [requestId, senderId]
      );
      const request = requestRows[0];
      if (!request) return res.status(403).json({ error: 'You can only message accepted matches.' });

      const result = await pool.query(
        `INSERT INTO messages (requestId, senderId, content) VALUES ($1, $2, $3) RETURNING id, createdAt`,
        [requestId, senderId, content.trim()]
      );

      const message = {
        id: result.rows[0].id,
        requestId: parseInt(requestId, 10),
        senderId,
        content: content.trim(),
        createdAt: result.rows[0].createdat,
      };

      res.status(201).json({ message: 'Message sent.', data: message });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get messages for a request
  router.get('/messages/:requestId', authMiddleware, async (req, res) => {
    const { requestId } = req.params;
    const userId = req.userId;

    try {
      const { rows: requestRows } = await pool.query(
        `SELECT * FROM requests WHERE id = $1 AND status = 'accepted' AND (senderId = $2 OR receiverId = $2)`,
        [requestId, userId]
      );
      const request = requestRows[0];
      if (!request) return res.status(403).json({ error: 'You can only view messages for your accepted matches.' });

      const { rows: messages } = await pool.query(
        `SELECT m.id, m.requestId, m.senderId, m.content, m.createdAt, u.name as sendername, u.image as senderimage
         FROM messages m
         JOIN users u ON m.senderId = u.id
         WHERE m.requestId = $1
         ORDER BY m.createdAt ASC`,
        [requestId]
      );
      res.json({ messages });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// Socket.io for real-time chat
function setupSocketIO(io) {
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', ({ userId, requestId }) => {
      connectedUsers.set(socket.id, { userId, requestId });
      socket.join(`request_${requestId}`);
      console.log(`User ${userId} joined request_${requestId}`);
    });

    socket.on('send_message', async ({ requestId, senderId, content }) => {
      try {
        const { rows: requestRows } = await pool.query(
          `SELECT * FROM requests WHERE id = $1 AND status = 'accepted' AND (senderId = $2 OR receiverId = $2)`,
          [requestId, senderId]
        );
        const request = requestRows[0];
        if (!request) return;

        const result = await pool.query(
          `INSERT INTO messages (requestId, senderId, content) VALUES ($1, $2, $3) RETURNING id, createdAt`,
          [requestId, senderId, content]
        );

        const { rows: userRows } = await pool.query(`SELECT id, name, image FROM users WHERE id = $1`, [senderId]);
        const user = userRows[0];

        const messageData = {
          id: result.rows[0].id,
          requestId: parseInt(requestId, 10),
          senderId,
          content,
          createdAt: result.rows[0].createdat,
          senderName: user?.name || 'Unknown',
          senderImage: user?.image || null,
        };

        io.to(`request_${requestId}`).emit('new_message', messageData);
      } catch (err) {
        console.error('Socket message error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      connectedUsers.delete(socket.id);
    });
  });
}

module.exports = { createMessageRoutes, setupSocketIO };
