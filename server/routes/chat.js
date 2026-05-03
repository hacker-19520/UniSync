import { Server } from 'socket.io';
import sql from '../../database.js';

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
      const requestRows = await sql`
        SELECT * FROM requests WHERE id = ${requestId} AND status = 'accepted' AND (senderId = ${senderId} OR receiverId = ${senderId})
      `;
      const request = requestRows[0];
      if (!request) return res.status(403).json({ error: 'You can only message accepted matches.' });

      const [result] = await sql`
        INSERT INTO messages (requestId, senderId, content) 
        VALUES (${requestId}, ${senderId}, ${content.trim()}) 
        RETURNING id, "createdAt"
      `;

      const message = {
        id: result.id,
        requestId: parseInt(requestId, 10),
        senderId,
        content: content.trim(),
        createdAt: result.createdAt,
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
      const requestRows = await sql`
        SELECT * FROM requests WHERE id = ${requestId} AND status = 'accepted' AND (senderId = ${userId} OR receiverId = ${userId})
      `;
      const request = requestRows[0];
      if (!request) return res.status(403).json({ error: 'You can only view messages for your accepted matches.' });

      const messages = await sql`
        SELECT m.id, m.requestId, m.senderId, m.content, m."createdAt", u.name as "sendername", u.image as "senderimage"
        FROM messages m
        JOIN users u ON m.senderId = u.id
        WHERE m.requestId = ${requestId}
        ORDER BY m."createdAt" ASC
      `;
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
        const requestRows = await sql`
          SELECT * FROM requests WHERE id = ${requestId} AND status = 'accepted' AND (senderId = ${senderId} OR receiverId = ${senderId})
        `;
        const request = requestRows[0];
        if (!request) return;

        const [result] = await sql`
          INSERT INTO messages (requestId, senderId, content) 
          VALUES (${requestId}, ${senderId}, ${content}) 
          RETURNING id, "createdAt"
        `;

        const userRows = await sql`SELECT id, name, image FROM users WHERE id = ${senderId}`;
        const user = userRows[0];

        const messageData = {
          id: result.id,
          requestId: parseInt(requestId, 10),
          senderId,
          content,
          createdAt: result.createdAt,
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

export { createMessageRoutes, setupSocketIO };

