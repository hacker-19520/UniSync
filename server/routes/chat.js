const { db } = require('../database');

// Express routes for messages
function createMessageRoutes(router, authMiddleware) {
  // Send a message
  router.post('/messages/:requestId', authMiddleware, (req, res) => {
    const { requestId } = req.params;
    const { content } = req.body;
    const senderId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Check if request exists and is accepted
    db.get(
      `SELECT * FROM requests WHERE id = ? AND status = 'accepted' AND (senderId = ? OR receiverId = ?)`,
      [requestId, senderId, senderId],
      (err, request) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!request) return res.status(403).json({ error: 'You can only message accepted matches.' });

        db.run(
          `INSERT INTO messages (requestId, senderId, content) VALUES (?, ?, ?)`,
          [requestId, senderId, content.trim()],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const message = {
              id: this.lastID,
              requestId: parseInt(requestId),
              senderId,
              content: content.trim(),
              createdAt: new Date().toISOString(),
            };

            res.status(201).json({ message: 'Message sent.', data: message });
          }
        );
      }
    );
  });

  // Get messages for a request
  router.get('/messages/:requestId', authMiddleware, (req, res) => {
    const { requestId } = req.params;
    const userId = req.userId;

    // Check if user is part of this request
    db.get(
      `SELECT * FROM requests WHERE id = ? AND status = 'accepted' AND (senderId = ? OR receiverId = ?)`,
      [requestId, userId, userId],
      (err, request) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!request) return res.status(403).json({ error: 'You can only view messages for your accepted matches.' });

        db.all(
          `SELECT m.id, m.requestId, m.senderId, m.content, m.createdAt, u.name as senderName, u.image as senderImage
           FROM messages m
           JOIN users u ON m.senderId = u.id
           WHERE m.requestId = ?
           ORDER BY m.createdAt ASC`,
          [requestId],
          (err, messages) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ messages });
          }
        );
      }
    );
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

    socket.on('send_message', ({ requestId, senderId, content }) => {
      // Check if request is accepted
      db.get(
        `SELECT * FROM requests WHERE id = ? AND status = 'accepted' AND (senderId = ? OR receiverId = ?)`,
        [requestId, senderId, senderId],
        (err, request) => {
          if (err || !request) return;

          db.run(
            `INSERT INTO messages (requestId, senderId, content) VALUES (?, ?, ?)`,
            [requestId, senderId, content],
            function (err) {
              if (err) return;

              // Fetch sender info
              db.get(
                `SELECT id, name, image FROM users WHERE id = ?`,
                [senderId],
                (err, user) => {
                  const messageData = {
                    id: this.lastID,
                    requestId: parseInt(requestId),
                    senderId,
                    content,
                    createdAt: new Date().toISOString(),
                    senderName: user?.name || 'Unknown',
                    senderImage: user?.image || null,
                  };

                  io.to(`request_${requestId}`).emit('new_message', messageData);
                }
              );
            }
          );
        }
      );
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      connectedUsers.delete(socket.id);
    });
  });
}

module.exports = { createMessageRoutes, setupSocketIO };
