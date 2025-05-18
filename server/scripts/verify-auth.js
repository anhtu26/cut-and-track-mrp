/**
 * Verify Authentication System
 * 
 * This script tests the authentication system against the Docker setup
 * to ensure everything is working correctly after rebuilding.
 */

require('dotenv').config();
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

// Test API server connection
async function testApiServer() {
  log.title('Testing API Server Connection');
  
  try {
    const response = await fetch(`${API_URL}/`);
    
    if (response.ok) {
      const data = await response.json();
      log.success(`API server is running: ${data.message}`);
      return true;
    } else {
      log.error(`API server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`API server error: ${error.message}`);
    log.info('Make sure the Docker containers are running with:');
    log.info('  docker-compose up -d');
    return false;
  }
}

// Test login API
async function testLogin() {
  log.title('Testing Login API');
  
  try {
    log.info(`Attempting to login with ${TEST_USER.email}`);
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log.success('Login successful!');
      log.info(`User: ${data.user.email}, Role: ${data.user.role}`);
      
      if (data.token) {
        log.success('Received JWT token');
        return data.token;
      } else {
        log.error('No token received');
        return null;
      }
    } else {
      log.error(`Login failed: ${response.status} - ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    log.error(`Login API error: ${error.message}`);
    return null;
  }
}

// Test protected endpoint
async function testProtectedEndpoint(token) {
  log.title('Testing Protected Endpoint');
  
  if (!token) {
    log.error('No token provided');
    return false;
  }
  
  try {
    log.info('Attempting to access protected user endpoint');
    
    const response = await fetch(`${API_URL}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log.success('Protected endpoint access successful!');
      log.info(`User ID: ${data.id}`);
      log.info(`Email: ${data.email}`);
      log.info(`Role: ${data.role}`);
      log.info(`Name: ${data.firstName} ${data.lastName}`);
      return true;
    } else {
      log.error(`Protected endpoint failed: ${response.status} - ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    log.error(`Protected endpoint error: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  log.title('Authentication System Verification');
  
  // Test API server
  const apiConnected = await testApiServer();
  
  if (!apiConnected) {
    log.error('API server test failed');
    process.exit(1);
  }
  
  // Test login
  const token = await testLogin();
  
  if (!token) {
    log.error('Login test failed');
    process.exit(1);
  }
  
  // Test protected endpoint
  const protectedEndpointWorking = await testProtectedEndpoint(token);
  
  if (!protectedEndpointWorking) {
    log.error('Protected endpoint test failed');
    process.exit(1);
  }
  
  log.title('Authentication System Verification Results');
  log.success('All authentication tests passed!');
  log.info('The authentication system is working correctly.');
  log.info(`You can use these credentials for testing:`);
  log.info(`Email: ${TEST_USER.email}`);
  log.info(`Password: ${TEST_USER.password}`);
}

// Run the main function
main().catch(err => {
  log.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
