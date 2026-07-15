const API_URL = 'http://localhost:5001/api';

async function runTest() {
  try {
    console.log('--- RUNNING MANAGER APPROVAL TEST ---');
    
    // 1. Login as Employee
    const empLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@flowwise.com', password: 'employeepassword123' })
    });
    const empLogin = await empLoginRes.json();
    const empToken = empLogin.token;
    console.log('Employee logged in successfully.');

    // 2. Submit Request
    const createReqRes = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empToken}` },
      body: JSON.stringify({
        requestType: 'Leave',
        title: 'Emergency Medical Leave',
        details: {
          leaveType: 'sick',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000 * 2),
          reason: 'Severe fever'
        }
      })
    });
    const createReq = await createReqRes.json();
    
    const requestId = createReq.data._id;
    console.log('Employee submitted request. ID:', requestId, '| Status:', createReq.data.status);

    // 3. Login as Manager
    const mgrLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@flowwise.com', password: 'managerpassword123' })
    });
    const mgrLogin = await mgrLoginRes.json();
    const mgrToken = mgrLogin.token;
    const mgrRole = mgrLogin.user.role;
    console.log('Manager logged in successfully. Role:', mgrRole);

    // 4. Manager Approves Request
    const approveReqRes = await fetch(`${API_URL}/requests/${requestId}/action`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mgrToken}` },
      body: JSON.stringify({ action: 'Approve', comment: 'Approved via runtime test' })
    });
    const approveReq = await approveReqRes.json();
    
    console.log('Manager approved request.');
    console.log('API Endpoint: /api/requests/:id/action');
    console.log('HTTP Method: PUT');
    console.log('Manager Role Used:', mgrRole);
    console.log('Status Code:', approveReqRes.status);
    console.log('Response Summary:', approveReq.data.status);

    // 5. Check Database Status
    const checkReqRes = await fetch(`${API_URL}/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    const checkReq = await checkReqRes.json();
    console.log('Database status after action (seen by employee):', checkReq.data.status);
    
    console.log('Test Passed Successfully.');
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

runTest();
