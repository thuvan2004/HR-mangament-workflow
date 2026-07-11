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

// Secure headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow static local images to load in browser
}));

// Cross Origin requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // React app development server urls
  credentials: true,
}));

// Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assets fallback folder
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Apply rate limiter to all APIs
app.use('/api', apiLimiter);

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route checklist
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Unknown Routes handling
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint route not found' });
});

// Global Error Middleware
app.use(errorHandler);

module.exports = app;
