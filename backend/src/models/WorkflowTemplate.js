const mongoose = require('mongoose');

const WorkflowStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    enum: ['Manager', 'HR', 'Admin'],
    required: true,
  },
  label: {
    type: String,
    default: 'Approval Step',
  },
});

const WorkflowTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  requestType: {
    type: String,
    enum: ['Leave', 'Expense', 'Asset', 'HRRequest'],
    required: true,
  },
  steps: [WorkflowStepSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('WorkflowTemplate', WorkflowTemplateSchema);
