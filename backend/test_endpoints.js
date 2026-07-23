import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api';

const runTests = async () => {
  console.log('=== VeriCode AI API Verification Tests ===');
  
  try {
    // 1. Health check
    console.log('\n[TEST 1] Checking server health...');
    const health = await axios.get('http://localhost:5050/health');
    console.log('✓ Health status:', health.data);

    // 2. Docs check
    console.log('\n[TEST 2] Fetching dynamic API documentation...');
    const docs = await axios.get(`${BASE_URL}/docs`);
    console.log('✓ Docs endpoints count:', docs.data.data.endpoints.length);

    // 3. Register user
    console.log('\n[TEST 3] Testing user registration...');
    const testEmail = `tester_${Date.now()}@example.com`;
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'API Tester',
      email: testEmail,
      password: 'password123'
    });
    console.log('✓ Registration successful:', registerResponse.data.message);
    const token = registerResponse.data.data.token;
    
    // Set headers
    const authHeaders = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 4. Get profile
    console.log('\n[TEST 4] Fetching authenticated user profile...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, authHeaders);
    console.log('✓ User profile:', meResponse.data.data.user);

    // 5. Code analysis
    console.log('\n[TEST 5] Sending code snippet for analysis...');
    const analyzeResponse = await axios.post(`${BASE_URL}/analyze`, {
      language: 'JavaScript',
      code: 'function add(a, b) { return a + b; }'
    }, authHeaders);
    console.log('✓ Analysis score received:', analyzeResponse.data.data.analysis.overallScore);
    console.log('✓ History ID generated:', analyzeResponse.data.data.historyId);
    const historyId = analyzeResponse.data.data.historyId;

    // 6. Explain code
    console.log('\n[TEST 6] Explaining code snippet...');
    const explainResponse = await axios.post(`${BASE_URL}/explain`, {
      language: 'JavaScript',
      code: 'function add(a, b) { return a + b; }'
    }, authHeaders);
    console.log('✓ Time Complexity:', explainResponse.data.data.timeComplexity);

    // 7. Fix code
    console.log('\n[TEST 7] Fixing code snippet...');
    const fixResponse = await axios.post(`${BASE_URL}/fix`, {
      language: 'JavaScript',
      code: 'function add(a, b) { return a + b; }'
    }, authHeaders);
    console.log('✓ Fixed Code snippet:', fixResponse.data.data.fix.fixedCode.replace(/\n/g, ' '));

    // 8. History search
    console.log('\n[TEST 8] Fetching analysis history list...');
    const historyList = await axios.get(`${BASE_URL}/history`, authHeaders);
    console.log(`✓ History items count: ${historyList.data.data.length}`);

    // 9. Dashboard
    console.log('\n[TEST 9] Fetching dashboard stats...');
    const stats = await axios.get(`${BASE_URL}/dashboard`, authHeaders);
    console.log('✓ Dashboard results:', stats.data.data);

    console.log('\n======================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('======================================');
  } catch (error) {
    console.error('✗ Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Details:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

runTests();
