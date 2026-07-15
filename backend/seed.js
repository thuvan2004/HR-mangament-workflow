const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load Models
const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Request = require('./src/models/Request');
const Holiday = require('./src/models/Holiday');
const AuditLog = require('./src/models/AuditLog');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Seeding Demo Data...');

    // 1. Clean up old demo data to be idempotent
    await User.deleteMany({ email: { $in: ['employee@flowwise.com', 'manager@flowwise.com', 'hr@flowwise.com', 'admin@flowwise.com'] } });
    
    // Also optionally clean old demo requests if we want, but better to just add a few.
    // Let's delete existing demo requests linked to these emails by first finding them? 
    // It's safer to just let them pile up or wipe only specific ones. We'll wipe all requests and logs for a clean slate if we want, but user said "Do not overwrite unrelated real users."
    
    // We will just recreate the users.
    const dept = await Department.findOneAndUpdate(
      { name: 'Engineering' },
      { name: 'Engineering', description: 'Software Development' },
      { upsert: true, new: true }
    );

    // 2. Create Users
    const users = await User.create([
      {
        name: 'Demo Admin',
        email: 'admin@flowwise.com',
        password: 'adminpassword123',
        role: 'admin',
        designation: 'System Administrator',
        status: 'Active',
        isVerified: true
      },
      {
        name: 'Demo HR',
        email: 'hr@flowwise.com',
        password: 'hrpassword123',
        role: 'hr',
        designation: 'HR Manager',
        status: 'Active',
        isVerified: true
      }
    ]);

    const admin = users[0];
    const hr = users[1];

    const managerUser = await User.create({
      name: 'Demo Manager',
      email: 'manager@flowwise.com',
      password: 'managerpassword123',
      role: 'manager',
      department: dept._id,
      designation: 'Engineering Manager',
      status: 'Active',
      isVerified: true
    });

    const employeeUser = await User.create({
      name: 'Demo Employee',
      email: 'employee@flowwise.com',
      password: 'employeepassword123',
      role: 'employee',
      department: dept._id,
      manager: managerUser._id,
      designation: 'Frontend Engineer',
      skills: ['React', 'Node.js'],
      status: 'Active',
      isVerified: true
    });

    // 3. Create Requests
    // We wipe existing requests from demo employee to keep it idempotent and not bloat DB
    await Request.deleteMany({ user: employeeUser._id });
    
    await Request.create([
      {
        user: employeeUser._id,
        requestType: 'Leave',
        title: 'Annual Summer Vacation',
        details: {
          leaveType: 'annual',
          startDate: new Date(Date.now() + 86400000 * 10), // 10 days from now
          endDate: new Date(Date.now() + 86400000 * 15),
          reason: 'Family vacation to Hawaii'
        },
        status: 'Pending',
        priority: 'Medium',
        assignedApprover: managerUser._id
      },
      {
        user: employeeUser._id,
        requestType: 'Leave',
        title: 'Sick Leave',
        details: {
          leaveType: 'sick',
          startDate: new Date(Date.now() - 86400000 * 5),
          endDate: new Date(Date.now() - 86400000 * 4),
          reason: 'Flu'
        },
        status: 'Approved',
        priority: 'Medium',
        assignedApprover: managerUser._id
      },
      {
        user: employeeUser._id,
        requestType: 'Expense',
        title: 'AWS Certification Reimbursement',
        details: {
          category: 'Other',
          amount: 150,
          reason: 'Passed AWS Certified Developer Associate'
        },
        status: 'Rejected',
        priority: 'Low',
        assignedApprover: managerUser._id
      },
      // Asset Requests (For Asset Tracking KPIs)
      {
        user: employeeUser._id,
        requestType: 'Asset',
        title: 'MacBook Pro M2 Upgrade',
        details: {
          assetName: 'MacBook Pro M2 16GB',
          assetType: 'Hardware',
          actionType: 'Request',
          reason: 'Old laptop is lagging'
        },
        status: 'Approved',
        priority: 'High',
        assignedApprover: admin._id
      },
      {
        user: employeeUser._id,
        requestType: 'Asset',
        title: 'WebStorm IDE License',
        details: {
          assetName: 'JetBrains WebStorm',
          assetType: 'Software',
          actionType: 'Request',
          reason: 'Required for advanced refactoring'
        },
        status: 'Approved',
        priority: 'Medium',
        assignedApprover: admin._id
      }
    ]);

    // 4. Create Holidays
    await Holiday.deleteMany({ title: 'Company Foundation Day' });
    await Holiday.create({
      title: 'Company Foundation Day',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
      type: 'Company Holiday',
      description: 'Annual celebration'
    });

    // 5. Create Audit Logs
    await AuditLog.create({
      user: admin._id,
      action: 'SYSTEM_SEED',
      details: 'Executed idempotent seed script to generate demo accounts and base workflow data.'
    });

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
