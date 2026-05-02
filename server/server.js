require("dotenv").config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { initDatabase } = require('./database');
const { authMiddleware } = require('./middleware/auth');
const { createMessageRoutes, setupSocketIO } = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database
(async () => {
  try {
    await initDatabase();
    console.log("✅ Database ready");
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
  }
})();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/match', require('./routes/match'));

// Chat routes (requires authMiddleware)
const chatRouter = express.Router();
createMessageRoutes(chatRouter, authMiddleware);
app.use('/api', chatRouter);

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Socket.io for real-time chat
setupSocketIO(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UniSync server is running!' });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback to frontend for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 UniSync server running on port ${PORT}`);
  console.log(`📧 Email OTP: ${process.env.SMTP_USER ? 'Configured' : 'Mock mode (check console)'}`);
});

