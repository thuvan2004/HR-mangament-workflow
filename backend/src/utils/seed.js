const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Department = require('../models/Department');
const WorkflowTemplate = require('../models/WorkflowTemplate');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

dotenv.config();

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flowwise_ai');
    console.log('[Seed] Connected. Purging database records...');

    // 1. Purge
    await User.deleteMany();
    await Department.deleteMany();
    await WorkflowTemplate.deleteMany();
    await Request.deleteMany();
    await Notification.deleteMany();
    await AuditLog.deleteMany();
    console.log('[Seed] Database purged successfully.');

    // 2. Create Departments
    console.log('[Seed] Seeding departments...');
    const engineeringDept = await Department.create({
      name: 'Engineering',
      description: 'Software development, product engineering, DevOps, and tech architecture.',
    });
    const hrDept = await Department.create({
      name: 'Human Resources',
      description: 'Talent management, employee onboarding, benefits, and workplace culture.',
    });
    const financeDept = await Department.create({
      name: 'Finance & Accounts',
      description: 'Corporate finance, budgeting, tax processing, and expense claims audits.',
    });
    console.log('[Seed] Departments seeded.');

    // 3. Create Users
    console.log('[Seed] Seeding user roles...');

    // A. Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@flowwise.com',
      password: 'adminpassword123',
      role: 'Admin',
      designation: 'IT Director',
      status: 'Active',
      isVerified: true,
      skills: ['DevOps', 'Security', 'Database Admin'],
    });

    // B. HR Lead
    const hrUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'hr@flowwise.com',
      password: 'hrpassword123',
      role: 'HR',
      designation: 'HR Lead Specialist',
      department: hrDept._id,
      status: 'Active',
      isVerified: true,
      skills: ['Onboarding', 'Conflict Resolution', 'Benefits Audit'],
    });
    hrDept.manager = hrUser._id;
    await hrDept.save();

    // C. Engineering Manager
    const managerUser = await User.create({
      name: 'John Smith',
      email: 'manager@flowwise.com',
      password: 'managerpassword123',
      role: 'Manager',
      designation: 'Engineering Manager',
      department: engineeringDept._id,
      status: 'Active',
      isVerified: true,
      skills: ['System Design', 'Project Management', 'Scrum'],
      leaveBalance: { annual: 18, sick: 9, casual: 6 },
    });
    engineeringDept.manager = managerUser._id;
    await engineeringDept.save();

    // D. Standard Employee (reports to John Smith)
    const employeeUser = await User.create({
      name: 'Alex Carter',
      email: 'employee@flowwise.com',
      password: 'employeepassword123',
      role: 'Employee',
      designation: 'Senior Frontend Engineer',
      department: engineeringDept._id,
      manager: managerUser._id,
      status: 'Active',
      isVerified: true,
      skills: ['React', 'TypeScript', 'TailwindCSS', 'Vite'],
      leaveBalance: { annual: 14, sick: 10, casual: 7 },
      emergencyContacts: [
        { name: 'Jane Carter', relation: 'Spouse', phone: '+1234567890' }
      ]
    });

    console.log('[Seed] User roles seeded.');

    // 4. Create Workflow Templates
    console.log('[Seed] Seeding workflow templates...');
    
    // Leave Template: Manager Review -> HR review
    const leaveTemplate = await WorkflowTemplate.create({
      name: 'Standard Leave Approval Template',
      description: 'Workflow for annual, sick, and casual leave applications.',
      requestType: 'Leave',
      steps: [
        { stepNumber: 1, role: 'Manager', label: 'Manager Review' },
        { stepNumber: 2, role: 'HR', label: 'HR Finalization' }
      ]
    });

    // Expense Template: Manager -> HR -> Admin (Multi-level)
    const expenseTemplate = await WorkflowTemplate.create({
      name: 'Enterprise Expense Reimbursement',
      description: 'Review claims, inspect invoice receipts, authorize payouts.',
      requestType: 'Expense',
      steps: [
        { stepNumber: 1, role: 'Manager', label: 'Manager Approval' },
        { stepNumber: 2, role: 'HR', label: 'HR Finance Review' },
        { stepNumber: 3, role: 'Admin', label: 'Executive Payout Authorization' }
      ]
    });

    // Asset Template: Manager -> HR Review
    const assetTemplate = await WorkflowTemplate.create({
      name: 'Corporate Asset Request & Returns',
      description: 'Deploy software access licenses, request monitors or laptops.',
      requestType: 'Asset',
      steps: [
        { stepNumber: 1, role: 'Manager', label: 'Manager Approval' },
        { stepNumber: 2, role: 'HR', label: 'HR Logistics Dispatch' }
      ]
    });

    // HR Letter: HR Review only
    const hrRequestTemplate = await WorkflowTemplate.create({
      name: 'HR Letter and ID Request Flow',
      description: 'Employment verification, salary reference letters, ID card issuances.',
      requestType: 'HRRequest',
      steps: [
        { stepNumber: 1, role: 'HR', label: 'HR Review' }
      ]
    });

    console.log('[Seed] Workflow templates seeded.');

    // 5. Seed active requests
    console.log('[Seed] Seeding active request instances...');

    // A. Pending Leave Request (Alex Carter -> Manager: John Smith)
    const leaveSla = new Date();
    leaveSla.setDate(leaveSla.getDate() + 3);

    const pendingLeave = await Request.create({
      user: employeeUser._id,
      requestType: 'Leave',
      title: 'Annual Holiday (3 days)',
      status: 'Pending',
      currentStepIndex: 0,
      assignedApprover: managerUser._id,
      slaDeadline: leaveSla,
      priority: 'Medium',
      details: {
        leaveType: 'annual',
        startDate: new Date('2026-08-15'),
        endDate: new Date('2026-08-18'),
        reason: 'Family summer vacation holiday planning.',
      },
      workflowSteps: [
        { stepNumber: 1, role: 'Manager', label: 'Manager Review', status: 'Pending' },
        { stepNumber: 2, role: 'HR', label: 'HR Finalization', status: 'Pending' }
      ],
      timeline: [
        {
          stepNumber: 0,
          action: 'Submitted',
          performedBy: employeeUser._id,
          performedByRole: 'Employee',
          comment: 'Going on family trip.',
        }
      ],
      aiInsights: {
        suggestion: 'Approve',
        confidence: 0.94,
        reasoning: 'Alex Carter has 14 annual days remaining. No clashes in Engineering department for mid-August.',
        priorityScore: 'Medium',
      }
    });

    // Notify Manager John Smith
    await Notification.create({
      recipient: managerUser._id,
      sender: employeeUser._id,
      message: `New Leave request pending review: 'Annual Holiday (3 days)' (Submitted by Alex Carter)`,
      request: pendingLeave._id,
      type: 'Leave',
    });

    // B. Completed Expense claim approved by Manager (John Smith) and HR (Sarah Jenkins), and Admin (System Admin)
    const completedExpense = await Request.create({
      user: employeeUser._id,
      requestType: 'Expense',
      title: 'AWS Cloud Developer Certification Reimbursement',
      status: 'Approved',
      currentStepIndex: 2,
      assignedApprover: null,
      priority: 'Low',
      details: {
        amount: 150,
        category: 'Software',
        receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
      },
      workflowSteps: [
        { stepNumber: 1, role: 'Manager', label: 'Manager Approval', status: 'Approved', completedBy: managerUser._id, completedAt: new Date() },
        { stepNumber: 2, role: 'HR', label: 'HR Finance Review', status: 'Approved', completedBy: hrUser._id, completedAt: new Date() },
        { stepNumber: 3, role: 'Admin', label: 'Executive Payout Authorization', status: 'Approved', completedBy: adminUser._id, completedAt: new Date() }
      ],
      timeline: [
        { stepNumber: 0, action: 'Submitted', performedBy: employeeUser._id, performedByRole: 'Employee', comment: 'Reimbursement for AWS Certification Exam.' },
        { stepNumber: 1, action: 'Approved', performedBy: managerUser._id, performedByRole: 'Manager', comment: 'Approved. Great learning initiative.' },
        { stepNumber: 2, action: 'Approved', performedBy: hrUser._id, performedByRole: 'HR', comment: 'Verified against certification policy.' },
        { stepNumber: 3, action: 'Approved', performedBy: adminUser._id, performedByRole: 'Admin', comment: 'Transaction processed.' }
      ],
      comments: [
        { user: managerUser._id, userName: 'John Smith', userRole: 'Manager', text: 'Alex, good job passing the certification!' }
      ],
      aiInsights: {
        suggestion: 'Approve',
        confidence: 0.98,
        reasoning: 'Professional education claims under $200 with attached PDF proof are highly compliant.',
        priorityScore: 'Low',
      }
    });

    // C. Pending Asset Laptop Request (Alex Carter -> Manager: John Smith)
    const assetSla = new Date();
    assetSla.setDate(assetSla.getDate() + 3);

    const pendingAsset = await Request.create({
      user: employeeUser._id,
      requestType: 'Asset',
      title: 'Upgrade to Macbook Pro 16"',
      status: 'Pending',
      currentStepIndex: 0,
      assignedApprover: managerUser._id,
      slaDeadline: assetSla,
      priority: 'High',
      details: {
        assetName: 'Macbook Pro M3 Max 16"',
        assetType: 'Hardware',
        actionType: 'Request',
        reason: 'Current dual-core work laptop is struggling with local compilation of docker nodes.',
      },
      workflowSteps: [
        { stepNumber: 1, role: 'Manager', label: 'Manager Approval', status: 'Pending' },
        { stepNumber: 2, role: 'HR', label: 'HR Logistics Dispatch', status: 'Pending' }
      ],
      timeline: [
        { stepNumber: 0, action: 'Submitted', performedBy: employeeUser._id, performedByRole: 'Employee', comment: 'Requested compilation upgrade.' }
      ],
      aiInsights: {
        suggestion: 'Review Required',
        confidence: 0.88,
        reasoning: 'Laptop upgrade requested within 18 months of previous hardware allocation. Check manager justification.',
        priorityScore: 'High',
      }
    });

    // Notify Manager John Smith
    await Notification.create({
      recipient: managerUser._id,
      sender: employeeUser._id,
      message: `New Asset request pending review: 'Upgrade to Macbook Pro 16"' (Submitted by Alex Carter)`,
      request: pendingAsset._id,
      type: 'Asset',
    });

    // D. Audit logs
    console.log('[Seed] Seeding audit log entries...');
    await AuditLog.create({
      user: adminUser._id,
      action: 'SYSTEM_SEED',
      details: 'Purged database and seeded initial workflow sandbox dataset.',
    });
    await AuditLog.create({
      user: employeeUser._id,
      action: 'USER_REGISTERED',
      details: 'Alex Carter account verified and added to Engineering Department.',
    });

    console.log('[Seed] Sandbox database loaded successfully!');
    console.log('========================================================================');
    console.log('FLOWWISE AI - DEMO WORKSPACE CREDENTIALS');
    console.log('------------------------------------------------------------------------');
    console.log('1. Role: Employee   | Email: employee@flowwise.com | Password: employeepassword123');
    console.log('2. Role: Manager    | Email: manager@flowwise.com  | Password: managerpassword123');
    console.log('3. Role: HR         | Email: hr@flowwise.com       | Password: hrpassword123');
    console.log('4. Role: Admin      | Email: admin@flowwise.com     | Password: adminpassword123');
    console.log('========================================================================');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to complete database seeding: ', error);
    process.exit(1);
  }
};

seedData();
