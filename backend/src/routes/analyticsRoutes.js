const express = require('express');
const { getDashboardMetrics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardMetrics);

module.exports = router;
