const WorkflowTemplate = require('../models/WorkflowTemplate');
const AuditLog = require('../models/AuditLog');

// @desc    Get all active workflow templates
// @route   GET /api/workflows
// @access  Private
const getWorkflowTemplates = async (req, res, next) => {
  try {
    const templates = await WorkflowTemplate.find({ isActive: true });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a workflow template
// @route   POST /api/workflows
// @access  Private (Admin / HR)
const createWorkflowTemplate = async (req, res, next) => {
  try {
    const { name, description, requestType, steps } = req.body;

    if (!steps || steps.length === 0) {
      return res.status(400).json({ success: false, message: 'Please specify at least one workflow approval step.' });
    }

    // Validate steps format
    const formattedSteps = steps.map((step, idx) => ({
      stepNumber: idx + 1,
      role: step.role,
      label: step.label || `Approval Step ${idx + 1}`,
    }));

    const template = await WorkflowTemplate.create({
      name,
      description,
      requestType,
      steps: formattedSteps,
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'WORKFLOW_TEMPLATE_CREATED',
      details: `Created workflow template ${name} for ${requestType} requests`,
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a workflow template
// @route   PUT /api/workflows/:id
// @access  Private (Admin / HR)
const updateWorkflowTemplate = async (req, res, next) => {
  try {
    let template = await WorkflowTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Workflow template not found' });
    }

    const { name, description, requestType, steps, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (requestType) updateData.requestType = requestType;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (steps && steps.length > 0) {
      updateData.steps = steps.map((step, idx) => ({
        stepNumber: idx + 1,
        role: step.role,
        label: step.label || `Approval Step ${idx + 1}`,
      }));
    }

    template = await WorkflowTemplate.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'WORKFLOW_TEMPLATE_UPDATED',
      details: `Updated workflow template ${template.name}`,
    });

    res.status(200).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a workflow template
// @route   DELETE /api/workflows/:id
// @access  Private (Admin)
const deleteWorkflowTemplate = async (req, res, next) => {
  try {
    const template = await WorkflowTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Workflow template not found' });
    }

    // Soft delete by disabling active flag
    template.isActive = false;
    await template.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'WORKFLOW_TEMPLATE_DELETED',
      details: `De-activated workflow template: ${template.name}`,
    });

    res.status(200).json({ success: true, message: 'Workflow template deleted (disabled) successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkflowTemplates,
  createWorkflowTemplate,
  updateWorkflowTemplate,
  deleteWorkflowTemplate,
};
