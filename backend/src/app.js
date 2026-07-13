const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Middlewares
const errorHandler = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const requestRoutes = require('./routes/requestRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hrmangament.netlify.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

// Secure headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Cross-Origin requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin, such as Postman or server requests
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assets
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'))
);

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
  });
});

// Unknown route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint route not found',
  });
});

// Global error middleware
app.use(errorHandler);

module.exports = app;