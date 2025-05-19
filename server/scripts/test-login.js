/**
 * Test Login Script
 * 
 * This script tests the login functionality by making a direct API call
 * to the authentication endpoint.
 */

const axios = require('axios');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Helper to log with colors
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.magenta}=== ${msg} ===${colors.reset}\n`)
};

// Test users
const TEST_USERS = [
  { email: 'admin@example.com', password: 'admin123', expectedRole: 'Administrator' },
  { email: 'manager@example.com', password: 'admin123', expectedRole: 'Manager' },
  { email: 'operator@example.com', password: 'admin123', expectedRole: 'Operator' }
];

// API URL
const API_URL = 'http://localhost:3002';

// Test login for a user
async function testLogin(user) {
  log.info(`Testing login for ${user.email}...`);
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    if (response.status === 200 && response.data.token) {
      log.success(`Login successful for ${user.email}`);
      log.info(`User role: ${response.data.user.role}`);
      log.info(`JWT token received: ${response.data.token.substring(0, 20)}...`);
      return true;
    } else {
      log.error(`Login failed for ${user.email}: Unexpected response`);
      console.log(response.data);
      return false;
    }
  } catch (error) {
    log.error(`Login failed for ${user.email}: ${error.message}`);
    if (error.response) {
      console.log(error.response.data);
    }
    return false;
  }
}

// Main function
async function main() {
  log.title('API Login Test');
  
  let successCount = 0;
  
  // Test API server connection
  log.info(`Testing API server connection at ${API_URL}...`);
  try {
    // Try to connect to the root endpoint first
    await axios.get(`${API_URL}`);
    log.success('API server is reachable');
  } catch (error) {
    log.error(`API server is not reachable: ${error.message}`);
    log.info('Make sure the API server is running and accessible at http://localhost:3002');
    process.exit(1);
  }
  
  // Test login for each user
  for (const user of TEST_USERS) {
    if (await testLogin(user)) {
      successCount++;
    }
  }
  
  // Report results
  log.title('Test Results');
  log.info(`Successful logins: ${successCount}/${TEST_USERS.length}`);
  
  if (successCount === TEST_USERS.length) {
    log.success('All login tests passed!');
    log.info('Authentication is working correctly.');
    log.info('\nCredentials:');
    log.info('Admin: admin@example.com / admin123');
    log.info('Manager: manager@example.com / admin123');
    log.info('Operator: operator@example.com / admin123');
  } else {
    log.error('Some login tests failed.');
    log.info('Please check the logs above for details.');
  }
}

// Run the main function
main().catch(err => {
  log.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
