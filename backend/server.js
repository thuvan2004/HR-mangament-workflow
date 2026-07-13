const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Allowed frontend URLs for Socket.IO
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hrmangament.netlify.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// Store Socket.IO instance in Express app
app.set('io', io);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join private notification room
  socket.on('join_room', (userId) => {
    if (userId) {
      const roomId = userId.toString();

      socket.join(roomId);

      console.log(
        `[Socket.IO] User ${roomId} joined their notification room.`
      );
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(
      `[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`
    );
  });
});

// Start server
server.listen(PORT, () => {
  console.log(
    `[Server] FlowWise AI backend running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error(`[Fatal Unhandled Error]: ${error.message}`);
});