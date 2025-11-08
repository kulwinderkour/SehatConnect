/**
 * Test Medicine Reminder API Endpoints
 * Run: node backend/test-reminders.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testReminderId = '';
let testDoseId = '';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log('\n' + '='.repeat(60));
  log(`TEST: ${name}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

// Test 1: Login
async function testLogin() {
  logTest('Login');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'demo@sehatconnect.com',
      password: 'demo123',
    });
    
    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      logSuccess(`Login successful. Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError('Login failed - no token received');
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: Create Reminder
async function testCreateReminder() {
  logTest('Create Medicine Reminder');
  
  const reminderData = {
    medicineName: 'Test Medicine',
    dosage: '100mg',
    frequency: 'twice_daily',
    times: ['09:00', '21:00'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    beforeMeal: false,
    afterMeal: true,
    instructions: 'Take with water',
    enableNotification: true,
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/reminders`, reminderData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.success) {
      testReminderId = response.data.data._id;
      logSuccess(`Reminder created: ${testReminderId}`);
      log(JSON.stringify(response.data.data, null, 2), 'blue');
      return true;
    }
  } catch (error) {
    logError(`Create reminder failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Get All Reminders
async function testGetReminders() {
  logTest('Get All Reminders');
  
  try {
    const response = await axios.get(`${BASE_URL}/reminders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.success) {
      logSuccess(`Found ${response.data.count} reminders`);
      log(JSON.stringify(response.data.data, null, 2), 'blue');
      return true;
    }
  } catch (error) {
    logError(`Get reminders failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Get Today's Reminders
async function testGetTodayReminders() {
  logTest('Get Today\'s Reminders');
  
  try {
    const response = await axios.get(`${BASE_URL}/reminders/today`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.success) {
      logSuccess(`Found ${response.data.count} reminders for today`);
      log(JSON.stringify(response.data.data, null, 2), 'blue');
      return true;
    }
  } catch (error) {
    logError(`Get today's reminders failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Get Statistics
async function testGetStats() {
  logTest('Get Reminder Statistics');
  
  try {
    const response = await axios.get(`${BASE_URL}/reminders/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.success) {
      logSuccess('Statistics retrieved');
      log(JSON.stringify(response.data.data, null, 2), 'blue');
      return true;
    }
  } catch (error) {
    logError(`Get stats failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Update Reminder
async function testUpdateReminder() {
  logTest('Update Reminder');
  
  try {
    const response = await axios.put(
      `${BASE_URL}/reminders/${testReminderId}`,
      { instructions: 'Take with food and water - UPDATED' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.success) {
      logSuccess('Reminder updated');
      log(JSON.stringify(response.data.data, null, 2), 'blue');
      return true;
    }
  } catch (error) {
    logError(`Update reminder failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Toggle Reminder
async function testToggleReminder() {
  logTest('Toggle Reminder Active Status');
  
  try {
    const response = await axios.patch(
      `${BASE_URL}/reminders/${testReminderId}/toggle`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.success) {
      logSuccess(`Reminder toggled: ${response.data.message}`);
      log(JSON.stringify(response.data.data, null, 2), 'blue');
      return true;
    }
  } catch (error) {
    logError(`Toggle reminder failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Delete Reminder (Cleanup)
async function testDeleteReminder() {
  logTest('Delete Reminder');
  
  try {
    const response = await axios.delete(
      `${BASE_URL}/reminders/${testReminderId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (response.data.success) {
      logSuccess('Reminder deleted successfully');
      return true;
    }
  } catch (error) {
    logError(`Delete reminder failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                            ║', 'cyan');
  log('║          MEDICINE REMINDER API TEST SUITE                 ║', 'cyan');
  log('║                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  console.log('\n');
  
  log(`Testing API at: ${BASE_URL}`, 'yellow');
  console.log('\n');
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Create Reminder', fn: testCreateReminder },
    { name: 'Get All Reminders', fn: testGetReminders },
    { name: 'Get Today\'s Reminders', fn: testGetTodayReminders },
    { name: 'Get Statistics', fn: testGetStats },
    { name: 'Update Reminder', fn: testUpdateReminder },
    { name: 'Toggle Reminder', fn: testToggleReminder },
    { name: 'Delete Reminder', fn: testDeleteReminder },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Summary
  console.log('\n');
  log('═'.repeat(60), 'cyan');
  log('TEST SUMMARY', 'cyan');
  log('═'.repeat(60), 'cyan');
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  log(`Total: ${tests.length}`, 'yellow');
  console.log('\n');
  
  if (failed === 0) {
    log('🎉 All tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed. Check the output above.', 'red');
  }
  
  console.log('\n');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    if (response.data.success) {
      logSuccess('Server is running');
      return true;
    }
  } catch (error) {
    logError('Server is not running. Please start the backend server first.');
    logError('Run: cd backend && npm start');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
})();
