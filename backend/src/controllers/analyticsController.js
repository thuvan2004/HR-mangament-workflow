const User = require('../models/User');
const Request = require('../models/Request');
const Department = require('../models/Department');

// @desc    Get dashboard metrics & chart data based on user role
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardMetrics = async (req, res, next) => {
  try {
    const role = req.user.role;

    // Base statistics
    const stats = {
      totalEmployees: await User.countDocuments(),
      totalDepartments: await Department.countDocuments(),
      pendingRequests: 0,
      approvedRequests: 0,
      activeWorkflows: await Request.countDocuments({ status: 'Pending' }),
      slaBreaches: 0,
    };

    // Pending Requests based on authorization scopes
    if (['HR', 'Admin'].includes(role)) {
      stats.pendingRequests = await Request.countDocuments({ status: 'Pending' });
      stats.approvedRequests = await Request.countDocuments({ status: 'Approved' });
    } else if (role === 'Manager') {
      stats.pendingRequests = await Request.countDocuments({ assignedApprover: req.user.id, status: 'Pending' });
      stats.approvedRequests = await Request.countDocuments({
        status: 'Approved',
        'timeline.performedBy': req.user.id,
      });
    } else {
      // Employee
      stats.pendingRequests = await Request.countDocuments({ user: req.user.id, status: 'Pending' });
      stats.approvedRequests = await Request.countDocuments({ user: req.user.id, status: 'Approved' });
    }

    // SLA breaches count
    stats.slaBreaches = await Request.countDocuments({
      status: 'Pending',
      slaDeadline: { $lt: new Date() },
    });

    // Recent Activites log (latest 5 requests)
    let recentActivitiesQuery = {};
    if (role === 'Employee') {
      recentActivitiesQuery.user = req.user.id;
    } else if (role === 'Manager') {
      recentActivitiesQuery.$or = [
        { user: req.user.id },
        { assignedApprover: req.user.id }
      ];
    }
    const recentRequests = await Request.find(recentActivitiesQuery)
      .populate('user', 'name role email')
      .populate('assignedApprover', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = recentRequests.map(r => {
      let desc = '';
      if (r.status === 'Pending') {
        desc = `Request "${r.title}" is pending review by ${r.assignedApprover ? r.assignedApprover.name : 'System'}`;
      } else {
        desc = `Request "${r.title}" was ${r.status.toLowerCase()}`;
      }

      return {
        id: r._id,
        user: r.user.name,
        action: r.requestType,
        details: desc,
        timestamp: r.updatedAt,
      };
    });

    // Chart Data: Monthly Trends (past 6 months)
    // We will generate static monthly summaries for chart rendering
    const monthlyTrends = [
      { month: 'Feb', Submitted: 12, Approved: 10, Rejected: 2 },
      { month: 'Mar', Submitted: 25, Approved: 20, Rejected: 5 },
      { month: 'Apr', Submitted: 32, Approved: 27, Rejected: 4 },
      { month: 'May', Submitted: 20, Approved: 18, Rejected: 2 },
      { month: 'Jun', Submitted: 45, Approved: 38, Rejected: 7 },
      { month: 'Jul', Submitted: 55, Approved: 48, Rejected: 4 },
    ];

    // Chart Data: Expense Categories Breakdown
    const expenseBreakdown = [
      { name: 'Travel', value: 4500 },
      { name: 'Hardware', value: 8200 },
      { name: 'Software', value: 3100 },
      { name: 'Meals', value: 1200 },
      { name: 'Office Supply', value: 800 },
    ];

    // Chart Data: Department Performance (average SLA completion hours)
    const departmentPerformance = [
      { name: 'Engineering', SLA: 18, target: 24 },
      { name: 'Product', SLA: 20, target: 24 },
      { name: 'Sales', SLA: 14, target: 24 },
      { name: 'HR', SLA: 26, target: 24 },
      { name: 'Finance', SLA: 22, target: 24 },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivities,
        monthlyTrends,
        expenseBreakdown,
        departmentPerformance,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
};
