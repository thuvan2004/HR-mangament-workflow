const express = require('express');
const {
  getWorkflowTemplates,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
} = require('../controllers/workflowController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getWorkflowTemplates);
router.post('/', protect, authorize('admin', 'hr'), createWorkflowTemplate);
router.put('/:id', protect, authorize('admin', 'hr'), updateWorkflowTemplate);
router.delete('/:id', protect, authorize('admin'), deleteWorkflowTemplate);

module.exports = router;
