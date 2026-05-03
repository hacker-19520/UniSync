import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import sql from './database.js';
import { authMiddleware } from './middleware/auth.js';
import { createMessageRoutes, setupSocketIO } from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Database ready (postgres lib auto-connects)
console.log("✅ Database ready");

// API Routes
app.use('/api/auth', await import('./routes/auth.js'));
app.use('/api/profile', await import('./routes/profile.js'));
app.use('/api/match', await import('./routes/match.js'));

// Chat routes (requires authMiddleware)
const chatRouter = express.Router();
createMessageRoutes(chatRouter, authMiddleware);
app.use('/api', chatRouter);

// Admin routes
app.use('/api/admin', await import('./routes/admin.js'));

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
