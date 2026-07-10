const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Store io in express application instance
app.set('io', io);

// Socket.IO orchestration
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // User authenticates and joins a private room based on their Mongoose User ID
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`[Socket.IO] User ${userId} joined their notification room.`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Run Server listener
server.listen(PORT, () => {
  console.log(`[Server] FlowWise AI backend running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Fatal Unhandled Error]: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
