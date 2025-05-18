/**
 * Complete Authentication System Test
 * 
 * This script tests the authentication system against a running server instance.
 * It verifies that all authentication endpoints are working correctly.
 */

require('dotenv').config();
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

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

// API URL - Default to local server, can be overridden with environment variables
const API_URL = process.env.API_URL || 'http://localhost:3002/api';

// Test user credentials - Default admin user created by init script
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Test server connection
async function testServerConnection() {
  log.info(`Testing connection to API server at ${API_URL}`);
  
  try {
    const response = await fetch(`${API_URL}`);
    
    if (response.ok) {
      log.success('Server is running and responding to requests');
      return true;
    } else {
      log.error(`Server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`Server connection error: ${error.message}`);
    log.info('Make sure the server is running before running this test');
    return false;
  }
}

// Test login with valid credentials
async function testLogin() {
  log.info('Testing login with valid credentials');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      log.error(`Login failed: ${data.error || response.statusText}`);
      return null;
    }
    
    if (!data.token) {
      log.error('Login response missing token');
      return null;
    }
    
    if (!data.user) {
      log.error('Login response missing user data');
      return null;
    }
    
    log.success('Login successful');
    log.info(`User: ${data.user.email}, Role: ${data.user.role}`);
    
    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    log.error(`Login error: ${error.message}`);
    return null;
  }
}

// Test protected user endpoint
async function testProtectedEndpoint(token) {
  log.info('Testing protected user endpoint with authentication');
  
  try {
    const response = await fetch(`${API_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      log.error(`Protected endpoint access failed: ${data.error || response.statusText}`);
      return false;
    }
    
    log.success('Successfully accessed protected endpoint');
    log.info(`User ID: ${data.id}, Email: ${data.email}`);
    
    return true;
  } catch (error) {
    log.error(`Protected endpoint error: ${error.message}`);
    return false;
  }
}

// Test logout
async function testLogout(token) {
  log.info('Testing logout endpoint');
  
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      log.error(`Logout failed: ${data.error || response.statusText}`);
      return false;
    }
    
    log.success('Logout successful');
    return true;
  } catch (error) {
    log.error(`Logout error: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  log.title('Authentication System Test');
  
  // Test server connection
  const serverConnected = await testServerConnection();
  
  if (!serverConnected) {
    log.error('Server connection failed. Aborting tests.');
    process.exit(1);
  }
  
  // Test login
  const loginResult = await testLogin();
  
  if (!loginResult) {
    log.error('Login test failed. Aborting tests.');
    process.exit(1);
  }
  
  // Test protected endpoint
  const protectedResult = await testProtectedEndpoint(loginResult.token);
  
  if (!protectedResult) {
    log.error('Protected endpoint test failed.');
    process.exit(1);
  }
  
  // Test logout
  const logoutResult = await testLogout(loginResult.token);
  
  if (!logoutResult) {
    log.error('Logout test failed.');
    process.exit(1);
  }
  
  // All tests passed
  log.title('Authentication System Test Results');
  log.success('All authentication tests passed!');
  log.info('\nAuthentication credentials:');
  log.info(`Email: ${TEST_USER.email}`);
  log.info(`Password: ${TEST_USER.password}`);
  log.info('\nYou can now use these credentials for frontend testing.');
}

// Run the tests
runTests().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
