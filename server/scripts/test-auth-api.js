/**
 * Test Authentication API
 * 
 * This script tests the authentication API by making direct HTTP requests
 * to the API server running in Docker.
 */

const fetch = require('node-fetch');

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

// Test user credentials
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// API URL
const API_URL = 'http://localhost:3002';

// Test login API with detailed error handling
async function testLogin() {
  log.title('Testing Login API');
  
  try {
    log.info(`Attempting to login with ${TEST_USER.email}`);
    log.info(`Request URL: ${API_URL}/api/auth/login`);
    log.info(`Request body: ${JSON.stringify(TEST_USER)}`);
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    log.info(`Response status: ${response.status}`);
    
    // Get response body as text first to debug
    const responseText = await response.text();
    log.info(`Response body (text): ${responseText}`);
    
    // Try to parse as JSON if possible
    let data;
    try {
      data = JSON.parse(responseText);
      log.info(`Response body (parsed): ${JSON.stringify(data, null, 2)}`);
    } catch (e) {
      log.error(`Failed to parse response as JSON: ${e.message}`);
    }
    
    if (response.ok) {
      if (data && data.token) {
        log.success('Login successful!');
        log.info(`User: ${data.user.email}, Role: ${data.user.role}`);
        log.info(`Token: ${data.token.substring(0, 20)}...`);
        return data.token;
      } else {
        log.error('Login response missing token or user data');
        return null;
      }
    } else {
      log.error(`Login failed: ${response.status} - ${data ? data.error : 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    log.error(`Login API error: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  log.title('Authentication API Test');
  
  // Test login
  const token = await testLogin();
  
  if (token) {
    log.success('Authentication API test passed!');
  } else {
    log.error('Authentication API test failed!');
  }
}

// Run the main function
main().catch(err => {
  log.error(`Unhandled error: ${err.message}`);
});
