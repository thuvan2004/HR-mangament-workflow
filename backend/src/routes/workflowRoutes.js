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
router.post('/', protect, authorize('Admin', 'HR'), createWorkflowTemplate);
router.put('/:id', protect, authorize('Admin', 'HR'), updateWorkflowTemplate);
router.delete('/:id', protect, authorize('Admin'), deleteWorkflowTemplate);

module.exports = router;
