const Holiday = require('../models/Holiday');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Get all holidays
// @route   GET /api/calendar/holidays
// @access  Private
const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.status(200).json({ success: true, count: holidays.length, data: holidays });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new holiday
// @route   POST /api/calendar/holidays
// @access  Private (HR / Admin)
const createHoliday = async (req, res, next) => {
  try {
    if (!['HR', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to create holidays' });
    }
    const holiday = await Holiday.create(req.body);
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calendar events (Holidays + Approved Leaves)
// @route   GET /api/calendar/events
// @access  Private
const getCalendarEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query; // optional filtering
    
    let holidayQuery = {};
    let leaveQuery = { requestType: 'Leave', status: 'Approved' };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      holidayQuery.date = { $gte: startDate, $lte: endDate };
      leaveQuery['details.startDate'] = { $lte: endDate };
      leaveQuery['details.endDate'] = { $gte: startDate };
    }

    // 1. Fetch holidays
    const holidays = await Holiday.find(holidayQuery);
    
    // 2. Fetch approved leaves based on role
    // Employees see team leaves, Managers see team leaves, HR/Admin see all
    if (req.user.role === 'Employee' || req.user.role === 'Manager') {
      const currentUser = await User.findById(req.user.id);
      if (currentUser.department) {
        const deptUsers = await User.find({ department: currentUser.department }).select('_id');
        const deptUserIds = deptUsers.map(u => u._id);
        leaveQuery.user = { $in: deptUserIds };
      } else {
        leaveQuery.user = req.user.id;
      }
    }

    const leaves = await Request.find(leaveQuery).populate('user', 'name role designation email');

    // Format for frontend
    const events = [];

    holidays.forEach(h => {
      events.push({
        id: h._id,
        title: h.title,
        date: h.date,
        type: h.type,
        isHoliday: true,
      });
    });

    leaves.forEach(l => {
      events.push({
        id: l._id,
        title: `${l.user.name} - ${l.details.leaveType} Leave`,
        startDate: l.details.startDate,
        endDate: l.details.endDate,
        user: l.user,
        isHoliday: false,
      });
    });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  getCalendarEvents,
};
