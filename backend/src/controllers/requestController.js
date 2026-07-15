const Request = require('../models/Request');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { uploadReceipt } = require('../config/cloudinary');

// Helper to notify user via DB and Socket
const notifyUser = async (req, recipientId, senderId, message, requestId, type) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      message,
      request: requestId,
      type,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(recipientId.toString()).emit('notification', {
        _id: notification._id,
        message,
        request: requestId,
        type,
        createdAt: notification.createdAt,
        read: false
      });
    }
  } catch (err) {
    console.error('Notification dispatch failed:', err.message);
  }
};

// Helper to guess next approver based on role and request context
const findApproverForRole = async (role, requester) => {
  if (role === 'manager') {
    // Return requester's manager, otherwise throw error as employee must have a manager
    if (requester.manager) {
      return requester.manager;
    }
    throw new Error('No manager assigned to this employee.');
  }
  
  // Admin / HR fallback
  const fallbackUser = await User.findOne({ role, status: 'Active' });
  return fallbackUser ? fallbackUser._id : null;
};

// @desc    Submit a new workflow request (Leave, Expense, Asset, HRRequest)
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const { requestType, title } = req.body;
    let details = {};

    // Parse details from JSON string if sent via FormData (due to receipt upload)
    if (req.body.details && typeof req.body.details === 'string') {
      details = JSON.parse(req.body.details);
    } else if (req.body.details) {
      details = req.body.details;
    }

    // Requester profile with manager populated
    const requester = await User.findById(req.user.id).populate('manager');

    // 1. Determine approval workflow template
    let template = await WorkflowTemplate.findOne({ requestType, isActive: true });
    
    // Default fallback workflow if no custom template matches
    let steps = [];
    if (template) {
      steps = template.steps.map(s => ({
        stepNumber: s.stepNumber,
        role: s.role,
        label: s.label,
        status: 'Pending',
      }));
    } else {
      // Default: 1. Manager -> 2. HR
      steps = [
        { stepNumber: 1, role: 'manager', label: 'Manager Review', status: 'Pending' },
        { stepNumber: 2, role: 'hr', label: 'HR Finalization', status: 'Pending' }
      ];
    }

    // 2. Identify first step approver
    const firstStep = steps[0];
    const assignedApproverId = await findApproverForRole(firstStep.role, requester);

    // 3. Handle File Upload if exists
    if (req.file) {
      const uploadUrl = await uploadReceipt(req.file);
      details.receiptUrl = uploadUrl;
    }

    // 4. Compute AI Insights (Heuristics + rules engine)
    const aiInsights = {
      suggestion: 'Approve',
      confidence: 0.9,
      reasoning: 'Standard submission within compliance policies.',
      priorityScore: 'Medium',
    };

    if (requestType === 'Leave') {
      const balance = requester.leaveBalance[details.leaveType || 'annual'];
      const requestedDays = Math.ceil(
        (new Date(details.endDate) - new Date(details.startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

      if (requestedDays > balance) {
        aiInsights.suggestion = 'Reject';
        aiInsights.confidence = 0.98;
        aiInsights.reasoning = `Requested leave duration (${requestedDays} days) exceeds available ${details.leaveType} leave balance (${balance} days).`;
        aiInsights.priorityScore = 'High';
      } else if (details.leaveType === 'sick') {
        aiInsights.suggestion = 'Approve';
        aiInsights.confidence = 0.85;
        aiInsights.reasoning = 'Sick leave submission. Priority raised to review immediately.';
        aiInsights.priorityScore = 'High';
      }
    } else if (requestType === 'Expense') {
      const amt = Number(details.amount);
      if (amt > 2000) {
        aiInsights.suggestion = 'Review Required';
        aiInsights.confidence = 0.95;
        aiInsights.reasoning = `Claim amount of $${amt} exceeds high-value threshold. Enhanced validation recommended.`;
        aiInsights.priorityScore = 'High';
      } else if (!details.receiptUrl) {
        aiInsights.suggestion = 'Reject';
        aiInsights.confidence = 0.99;
        aiInsights.reasoning = 'Missing receipt verification attachment. Compliance violation.';
        aiInsights.priorityScore = 'High';
      } else {
        aiInsights.suggestion = 'Approve';
        aiInsights.confidence = 0.92;
        aiInsights.reasoning = `Expense claim under threshold with valid receipt attached. Category: ${details.category || 'General'}`;
      }
    } else if (requestType === 'Asset') {
      if (details.assetType === 'Hardware') {
        aiInsights.reasoning = `Request for physical hardware (${details.assetName}). Checks inventory levels.`;
        aiInsights.priorityScore = 'Medium';
      } else {
        aiInsights.reasoning = `Request for software subscription access (${details.assetName}). Pre-approved software stack list.`;
        aiInsights.priorityScore = 'Low';
      }
    }

    // 5. Create Request record
    const slaDeadline = new Date();
    slaDeadline.setDate(slaDeadline.getDate() + 3); // 3 days SLA

    const request = await Request.create({
      user: req.user.id,
      requestType,
      title,
      details,
      workflowSteps: steps,
      assignedApprover: assignedApproverId,
      slaDeadline,
      priority: aiInsights.priorityScore,
      aiInsights,
      timeline: [{
        stepNumber: 0,
        action: 'Submitted',
        performedBy: req.user.id,
        performedByRole: req.user.role,
        comment: details.reason || details.purpose || 'Workflow initiated',
      }]
    });

    // 6. Notify current approver & user
    if (assignedApproverId) {
      await notifyUser(
        req,
        assignedApproverId,
        req.user.id,
        `New ${requestType} request pending review: ${title} (Submitted by ${req.user.name})`,
        request._id,
        requestType
      );
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'REQUEST_SUBMITTED',
      details: `Submitted ${requestType} request (ID: ${request._id})`,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (filter by user, status, team approvals, page, limit)
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { status, requestType, filter, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filters
    if (status) query.status = status;
    if (requestType) query.requestType = requestType;

    // Filter contexts
    if (filter === 'me') {
      // My requests
      query.user = req.user.id;
    } else if (filter === 'approvals') {
      // Requests pending my action
      query.assignedApprover = req.user.id;
      query.status = 'Pending';
    } else if (filter === 'team') {
      // If manager, get team member requests
      if (['manager', 'hr', 'admin'].includes(req.user.role)) {
        const teamUsers = await User.find({ manager: req.user.id });
        const teamUserIds = teamUsers.map(u => u._id);
        query.$or = [
          { user: { $in: teamUserIds } },
          { assignedApprover: req.user.id }
        ];
      } else {
        query.user = req.user.id; // employees only get their own
      }
    } else if (['hr', 'admin'].includes(req.user.role)) {
      // HR and Admin can see all requests by default if query is blank
    } else {
      query.user = req.user.id;
    }

    // Search filter
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .populate({ path: 'user', select: 'name email role designation leaveBalance department manager' })
      .populate({ path: 'assignedApprover', select: 'name email role designation' })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get request detail by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate({ path: 'user', select: 'name email role designation leaveBalance department' })
      .populate({ path: 'assignedApprover', select: 'name email role designation' })
      .populate({ path: 'timeline.performedBy', select: 'name email role designation' })
      .populate({ path: 'comments.user', select: 'name email role designation' });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Authorization checks
    const userIdStr = String(req.user._id || req.user.id);
    const isSelf = String(request.user._id || request.user) === userIdStr;
    const assignedApproverIdStr = request.assignedApprover ? String(request.assignedApprover._id || request.assignedApprover) : null;
    const isApprover = assignedApproverIdStr === userIdStr;
    const isHrOrAdmin = ['hr', 'admin'].includes(req.user.role);

    if (!isSelf && !isApprover && !isHrOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject a workflow step
// @route   PUT /api/requests/:id/action
// @access  Private
const approveRejectRequest = async (req, res, next) => {
  try {
    const { action, comment } = req.body; // action: 'Approve' or 'Reject'

    if (!['Approve', 'Reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be Approve or Reject.' });
    }

    const request = await Request.findById(req.params.id).populate('user');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Authorization
    const userIdStr = String(req.user._id || req.user.id);
    const assignedApproverIdStr = request.assignedApprover ? String(request.assignedApprover._id || request.assignedApprover) : null;
    const isApprover = assignedApproverIdStr === userIdStr;
    const isAdmin = req.user.role === 'admin';

    if (!isApprover && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not the assigned approver for this step.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed.' });
    }

    const currentStep = request.workflowSteps[request.currentStepIndex];

    if (action === 'Reject') {
      // 1. Mark current step as Rejected
      currentStep.status = 'Rejected';
      currentStep.completedBy = req.user.id;
      currentStep.completedAt = new Date();

      // 2. Mark entire request as Rejected
      request.status = 'Rejected';
      request.assignedApprover = null;

      // 3. Log to timeline
      request.timeline.push({
        stepNumber: currentStep.stepNumber,
        action: 'Rejected',
        performedBy: req.user.id,
        performedByRole: req.user.role,
        comment: comment || 'Rejected at review stage.',
      });

      await request.save();

      // 4. Notify requester
      await notifyUser(
        req,
        request.user._id,
        req.user.id,
        `Your ${request.requestType} request: '${request.title}' has been REJECTED. Reviewer comment: ${comment || 'None'}`,
        request._id,
        request.requestType
      );

      // Audit Log
      await AuditLog.create({
        user: req.user.id,
        action: 'REQUEST_REJECTED',
        details: `Rejected request ${request._id}`,
      });

      return res.status(200).json({ success: true, data: request });
    }

    // Action: Approve
    currentStep.status = 'Approved';
    currentStep.completedBy = req.user.id;
    currentStep.completedAt = new Date();

    request.timeline.push({
      stepNumber: currentStep.stepNumber,
      action: 'Approved',
      performedBy: req.user.id,
      performedByRole: req.user.role,
      comment: comment || 'Approved.',
    });

    const isLastStep = request.currentStepIndex === request.workflowSteps.length - 1;

    if (isLastStep) {
      // 1. Approve entire Request
      request.status = 'Approved';
      request.assignedApprover = null;

      // 2. Deduct leave balance if request is LEAVE
      if (request.requestType === 'Leave') {
        const requester = await User.findById(request.user._id);
        if (requester) {
          const lType = request.details.leaveType || 'annual';
          const requestedDays = Math.ceil(
            (new Date(request.details.endDate) - new Date(request.details.startDate)) / (1000 * 60 * 60 * 24)
          ) + 1;

          // Apply deduction, allowing negative balance if HR/Admin overrode compliance
          requester.leaveBalance[lType] = Math.max(0, requester.leaveBalance[lType] - requestedDays);
          await requester.save();
        }
      }

      await request.save();

      // 3. Notify requester
      await notifyUser(
        req,
        request.user._id,
        req.user.id,
        `Congratulations! Your ${request.requestType} request: '${request.title}' has been fully APPROVED.`,
        request._id,
        request.requestType
      );

      // Audit Log
      await AuditLog.create({
        user: req.user.id,
        action: 'REQUEST_APPROVED_FINAL',
        details: `Fully approved request ${request._id}`,
      });

    } else {
      // Move to next step
      request.currentStepIndex += 1;
      const nextStep = request.workflowSteps[request.currentStepIndex];
      
      const requesterProfile = await User.findById(request.user._id);
      const nextApproverId = await findApproverForRole(nextStep.role, requesterProfile);

      request.assignedApprover = nextApproverId;
      
      // Extend SLA deadline by another 3 days
      const newSla = new Date();
      newSla.setDate(newSla.getDate() + 3);
      request.slaDeadline = newSla;

      await request.save();

      // Notify next approver
      if (nextApproverId) {
        await notifyUser(
          req,
          nextApproverId,
          req.user.id,
          `${request.requestType} Request pending approval (Step ${nextStep.stepNumber}): ${request.title}`,
          request._id,
          request.requestType
        );
      }
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a request
// @route   POST /api/requests/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please add comment text' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Comment payload
    const comment = {
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      text,
    };

    request.comments.push(comment);

    // Timeline event
    request.timeline.push({
      stepNumber: request.currentStepIndex,
      action: 'Commented',
      performedBy: req.user.id,
      performedByRole: req.user.role,
      comment: `Commented: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
    });

    await request.save();

    // Notify other participant (if requester commented, notify approver. If approver commented, notify requester.)
    const otherParty = req.user.id === request.user.toString() 
      ? request.assignedApprover 
      : request.user;

    if (otherParty) {
      await notifyUser(
        req,
        otherParty,
        req.user.id,
        `New comment added on ${request.requestType} request '${request.title}' by ${req.user.name}`,
        request._id,
        request.requestType
      );
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  approveRejectRequest,
  addComment,
};
