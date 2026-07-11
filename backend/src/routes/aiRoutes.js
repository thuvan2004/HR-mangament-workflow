const express = require('express');
const {
  getAIAssistantResponse,
  getAIApprovalSuggestion,
  getAIEmployeeInsights,
} = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/assistant', protect, getAIAssistantResponse);
router.get('/suggest/:requestId', protect, getAIApprovalSuggestion);
router.get('/insights', protect, authorize('Manager', 'HR', 'Admin'), getAIEmployeeInsights);

module.exports = router;
