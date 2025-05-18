/**
 * Test Authentication System
 * 
 * This script tests the authentication API endpoints to ensure they're working correctly.
 * It verifies login, user info, and logout functionality.
 */

// Import dependencies
const fetch = require('node-fetch');
const { validate: validateUUID } = require('uuid');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper to log with colors
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.magenta}=== ${msg} ===${colors.reset}\n`),
  separator: () => console.log(`${colors.cyan}----------------------------------------${colors.reset}`)
};

// API URL configuration - works with Docker services
const API_URL = process.env.API_URL || 'http://localhost:3002/api';

// Test credentials
const testCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

/**
 * Test the authentication API endpoints
 */
async function testAuthAPI() {
  log.title('Testing Authentication API');
  
  // Test login
  log.info('Testing login endpoint...');
  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials)
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      log.error(`Login failed: ${loginData.error || loginResponse.statusText}`);
      return null;
    }
    
    if (!loginData.token) {
      log.error('Login succeeded but no token was returned');
      return null;
    }
    
    if (!loginData.user || !loginData.user.id) {
      log.error('Login succeeded but no valid user was returned');
      return null;
    }
    
    log.success('Login endpoint working correctly');
    log.info(`Token received: ${loginData.token.substring(0, 15)}...`);
    log.info(`User ID: ${loginData.user.id}`);
    log.info(`User role: ${loginData.user.role}`);
    
    // Test user info
    log.info('\nTesting user info endpoint...');
    const userInfoResponse = await fetch(`${API_URL}/auth/user`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const userInfo = await userInfoResponse.json();
    
    if (!userInfoResponse.ok) {
      log.error(`User info failed: ${userInfo.error || userInfoResponse.statusText}`);
      return null;
    }
    
    if (!validateUUID(userInfo.id)) {
      log.error('User info succeeded but returned invalid user ID');
      return null;
    }
    
    log.success('User info endpoint working correctly');
    log.info(`User ID: ${userInfo.id}`);
    log.info(`User email: ${userInfo.email}`);
    
    // Test logout
    log.info('\nTesting logout endpoint...');
    const logoutResponse = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    const logoutData = await logoutResponse.json();
    
    if (!logoutResponse.ok) {
      log.error(`Logout failed: ${logoutData.error || logoutResponse.statusText}`);
      return null;
    }
    
    log.success('Logout endpoint working correctly');
    
    return {
      token: loginData.token,
      user: loginData.user
    };
  } catch (error) {
    log.error(`API test failed: ${error.message}`);
    log.info('Check if the API server is running and accessible');
    log.info(`Attempted to connect to ${API_URL}`);
    return null;
  }
}

/**
 * Run the full test suite
 */
async function runTests() {
  log.title('Starting Authentication System Tests');
  
  log.info('Testing against API URL: ' + API_URL);
  log.info('Ensure the server is running before running this test');
  log.separator();
  
  // Test the API
  const apiResult = await testAuthAPI();
  
  if (!apiResult) {
    log.error('Authentication system tests failed');
    process.exit(1);
  }
  
  log.separator();
  
  // All tests passed
  log.title('All Authentication Tests Passed');
  log.success('The authentication system is working correctly!');
  
  log.info('\nNext steps:');
  log.info('1. Ensure the frontend is using the new authentication system');
  log.info('2. Remove all Supabase dependencies and references from the codebase');
  
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
