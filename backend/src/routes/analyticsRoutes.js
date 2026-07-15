const express = require('express');
const { getDashboardMetrics, getAuditLogs } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardMetrics);
router.get('/audit-logs', protect, getAuditLogs);

module.exports = router;
