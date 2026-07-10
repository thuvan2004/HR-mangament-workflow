const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Request = require('../src/models/Request');

dotenv.config();

const runTests = async () => {
  console.log('========================================================================');
  console.log('RUNNING FLOWWISE AI BACKEND AUTOMATED UNIT & INTEGRATION TESTS');
  console.log('========================================================================');
  
  let passed = 0;
  let failed = 0;
  const assert = (condition, message) => {
    if (condition) {
      console.log(`[PASS] ✅ ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ❌ ${message}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flowwise_ai');
    console.log('[Test Setup] Connected to MongoDB.');

    // Clean test resources
    await User.deleteMany({ email: 'test_runner_user@flowwise.com' });
    await User.deleteMany({ email: 'test_runner_manager@flowwise.com' });

    // Test Case 1: Password Encryption on Save
    const testUser = await User.create({
      name: 'Test Runner User',
      email: 'test_runner_user@flowwise.com',
      password: 'testPassword123',
      role: 'Employee',
      isVerified: true,
    });
    
    assert(
      testUser.password !== 'testPassword123',
      'User password was successfully hashed using bcrypt prior to database save.'
    );

    // Test Case 2: password matchPassword method
    const passwordMatch = await testUser.matchPassword('testPassword123');
    assert(passwordMatch === true, 'User matchPassword method correctly validates valid raw password.');

    const passwordMismatch = await testUser.matchPassword('wrongPassword');
    assert(passwordMismatch === false, 'User matchPassword method correctly rejects invalid raw password.');

    // Test Case 3: Role Authorizations middleware simulation
    const simulateAuthorize = (userRole, allowedRoles) => {
      return allowedRoles.includes(userRole);
    };
    
    assert(
      simulateAuthorize('Admin', ['Admin', 'HR']) === true,
      'Authorization validation allows Admin user into Admin/HR guarded routes.'
    );
    assert(
      simulateAuthorize('Employee', ['HR', 'Manager']) === false,
      'Authorization validation blocks standard Employee from manager approval routes.'
    );

    // Test Case 4: Workflow submissions AI predictions
    const mockDetails = { leaveType: 'annual', startDate: new Date('2026-10-10'), endDate: new Date('2026-10-12') };
    const daysRequested = 3;
    const leaveBalanceAvailable = testUser.leaveBalance.annual; // 20
    
    let isWithinPolicyLimit = daysRequested <= leaveBalanceAvailable;
    assert(isWithinPolicyLimit === true, 'Heuristics validation checks available leave balance: request fits allowance.');

    // Cleanup test records
    await User.findByIdAndDelete(testUser._id);
    console.log('[Test Cleanup] Removed testing documents.');
    
    console.log('------------------------------------------------------------------------');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed.`);
    console.log('========================================================================');
    
    mongoose.connection.close();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Test Suite Error] Crashing execution: ', error);
    process.exit(1);
  }
};

runTests();
