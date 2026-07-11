const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  stepNumber: Number,
  action: {
    type: String,
    enum: ['Submitted', 'Approved', 'Rejected', 'Commented', 'Escalated'],
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  performedByRole: String,
  comment: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  userRole: String,
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const WorkflowStepInstanceSchema = new mongoose.Schema({
  stepNumber: Number,
  role: {
    type: String,
    enum: ['Manager', 'HR', 'Admin'],
    required: true,
  },
  label: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  completedAt: Date,
});

const RequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestType: {
    type: String,
    enum: ['Leave', 'Expense', 'Asset', 'HRRequest'],
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  details: {
    // Leave fields
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'casual'],
    },
    startDate: Date,
    endDate: Date,
    reason: String,

    // Expense fields
    amount: Number,
    category: String,
    receiptUrl: String,

    // Asset fields
    assetName: String,
    assetType: {
      type: String,
      enum: ['Hardware', 'Software'],
    },
    actionType: {
      type: String,
      enum: ['Request', 'Return'],
      default: 'Request',
    },

    // HR Letter fields
    letterType: {
      type: String,
      enum: ['Salary Certificate', 'Employment Verification', 'ID Card Request', 'HR General Letter'],
    },
    purpose: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  currentStepIndex: {
    type: Number,
    default: 0, // Points to the index of workflowSteps
  },
  assignedApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Current user assigned to review this request
  },
  workflowSteps: [WorkflowStepInstanceSchema],
  timeline: [TimelineEventSchema],
  comments: [CommentSchema],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  slaDeadline: {
    type: Date,
  },
  aiInsights: {
    suggestion: { type: String, default: 'Approve' },
    confidence: { type: Number, default: 0.8 },
    reasoning: { type: String, default: 'Analyzed with standard company policy compliance.' },
    priorityScore: { type: String, default: 'Medium' },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Request', RequestSchema);
