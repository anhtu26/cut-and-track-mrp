/**
 * Authentication Test Script
 * 
 * This script tests the local API authentication functionality
 * to verify that the authentication system is working properly.
 */

import axios from 'axios';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3002/api';
const TEST_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

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

// Test login functionality
async function testLogin() {
  log.title('Testing Login Functionality');
  log.info(`Attempting to login with test credentials to ${API_URL}/auth/login`);
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (response.data && response.data.token) {
      log.success('Login successful!');
      log.info(`Token received: ${response.data.token.substring(0, 15)}...`);
      log.info(`User role: ${response.data.user.role}`);
      return response.data;
    } else {
      log.error('Login failed: No token received');
      return null;
    }
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test getting current user
async function testGetCurrentUser(token) {
  log.title('Testing Get Current User');
  log.info(`Fetching current user data from ${API_URL}/auth/me`);
  
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data) {
      log.success('User data retrieved successfully!');
      log.info(`User ID: ${response.data.id}`);
      log.info(`User Email: ${response.data.email}`);
      log.info(`User Role: ${response.data.role}`);
      return response.data;
    } else {
      log.error('Failed to retrieve user data');
      return null;
    }
  } catch (error) {
    log.error(`Get user failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Test getting all users (admin only)
async function testGetAllUsers(token) {
  log.title('Testing Get All Users (Admin Only)');
  log.info(`Fetching all users from ${API_URL}/auth/users`);
  
  try {
    const response = await axios.get(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && Array.isArray(response.data)) {
      log.success('Users retrieved successfully!');
      log.info(`Total users: ${response.data.length}`);
      return response.data;
    } else {
      log.error('Failed to retrieve users');
      return null;
    }
  } catch (error) {
    log.error(`Get users failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Run all tests
async function runTests() {
  log.title('Starting Authentication Tests');
  
  // Test login
  const loginData = await testLogin();
  if (!loginData) {
    log.error('Login test failed. Cannot continue with other tests.');
    return;
  }
  
  const { token } = loginData;
  
  // Test get current user
  const userData = await testGetCurrentUser(token);
  if (!userData) {
    log.warning('Get current user test failed.');
  }
  
  // Test get all users (admin only)
  const usersData = await testGetAllUsers(token);
  if (!usersData) {
    log.warning('Get all users test failed. This might be expected if the test user is not an admin.');
  }
  
  log.title('Authentication Tests Completed');
}

// Run the tests
runTests().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
