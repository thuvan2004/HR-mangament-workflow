const User = require('../models/User');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

// @desc    Get all employees (with search, filtering, and pagination)
// @route   GET /api/employees
// @access  Private (All authenticated users can list)
const getEmployees = async (req, res, next) => {
  try {
    const { department, skill, status, role, search, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filtering
    if (department) query.department = department;
    if (status) query.status = status;
    if (role) query.role = role;
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('department')
      .populate({ path: 'manager', select: 'name email role designation' })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id)
      .populate('department')
      .populate({ path: 'manager', select: 'name email designation role' });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee profile (HR / Admin only)
// @route   POST /api/employees
// @access  Private (Admin/HR)
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, designation, department, manager, skills, emergencyContacts, leaveBalance } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const newEmployee = await User.create({
      name,
      email,
      password: password || 'Welcome@123', // Default temporary password
      role: role || 'Employee',
      designation,
      department,
      manager,
      skills: skills || [],
      emergencyContacts: emergencyContacts || [],
      leaveBalance: leaveBalance || { annual: 20, sick: 10, casual: 7 },
      isVerified: true, // Internal employee registrations are pre-verified
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'EMPLOYEE_CREATED',
      details: `Created new employee: ${name} (${email}) with role ${role}`,
    });

    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee profile
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    let employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Role restrictions: Employees can only edit their own skills & emergency contacts
    const isSelf = req.user.id === employee._id.toString();
    const isHrOrAdmin = ['HR', 'Admin'].includes(req.user.role);

    if (!isSelf && !isHrOrAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this profile' });
    }

    const {
      name,
      skills,
      emergencyContacts,
      // Privileged fields (Admin / HR only)
      role,
      status,
      designation,
      department,
      manager,
      leaveBalance,
    } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (skills) updateData.skills = skills;
    if (emergencyContacts) updateData.emergencyContacts = emergencyContacts;

    if (isHrOrAdmin) {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (designation) updateData.designation = designation;
      if (department !== undefined) updateData.department = department || null;
      if (manager !== undefined) updateData.manager = manager || null;
      if (leaveBalance) updateData.leaveBalance = leaveBalance;
    }

    employee = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('department').populate({ path: 'manager', select: 'name email role designation' });

    await AuditLog.create({
      user: req.user.id,
      action: 'EMPLOYEE_UPDATED',
      details: `Updated employee profile of ${employee.name} (${employee.email})`,
    });

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee (Admin only)
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Instead of hard deleting, we can suspend or delete the record. Let's do a hard delete for simplicity but log it.
    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.id,
      action: 'EMPLOYEE_DELETED',
      details: `Deleted employee profile: ${employee.name} (${employee.email})`,
    });

    res.status(200).json({ success: true, message: 'Employee profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate({ path: 'manager', select: 'name email role designation' });
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin / HR)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, manager } = req.body;

    const deptExists = await Department.findOne({ name });
    if (deptExists) {
      return res.status(400).json({ success: false, message: 'Department already exists with that name' });
    }

    const department = await Department.create({ name, description, manager });

    // Update the manager user's role to Manager if they aren't HR/Admin already
    if (manager) {
      const managerUser = await User.findById(manager);
      if (managerUser && ['Employee'].includes(managerUser.role)) {
        managerUser.role = 'Manager';
        await managerUser.save();
      }
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DEPARTMENT_CREATED',
      details: `Created department ${name}`,
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin / HR)
const updateDepartment = async (req, res, next) => {
  try {
    let department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { name, description, manager } = req.body;

    department = await Department.findByIdAndUpdate(req.params.id, { name, description, manager }, {
      new: true,
      runValidators: true,
    });

    // Make sure manager user is assigned Manager role
    if (manager) {
      const managerUser = await User.findById(manager);
      if (managerUser && ['Employee'].includes(managerUser.role)) {
        managerUser.role = 'Manager';
        await managerUser.save();
      }
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DEPARTMENT_UPDATED',
      details: `Updated department ${department.name}`,
    });

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Admin only)
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Department.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.id,
      action: 'DEPARTMENT_DELETED',
      details: `Deleted department ${department.name}`,
    });

    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
