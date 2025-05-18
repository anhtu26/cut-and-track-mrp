/**
 * Authentication Test Script
 * 
 * This script tests the local authentication API endpoints
 * to verify that the migration from Supabase was successful.
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_URL = 'http://localhost:3002/api';

// Try multiple test credentials since we don't know the exact ones in the migrated database
const TEST_USERS = [
  {
    email: 'admin@example.com',
    password: 'admin123'
  },
  {
    email: 'admin@cutandtrack.com',
    password: 'admin123'
  },
  {
    email: 'admin@aerospace.com',
    password: 'admin123'
  }
];

// Current test user (will try each one)
let currentTestUserIndex = 0;

// Helper function to log test results
function logResult(testName, success, message) {
  if (success) {
    console.log(chalk.green(`✓ ${testName}: ${message}`));
  } else {
    console.log(chalk.red(`✗ ${testName}: ${message}`));
  }
}

// Main test function
async function runTests() {
  console.log(chalk.blue('=== Testing Local Authentication API ==='));
  
  let authToken = null;
  let userId = null;
  let successfulUser = null;
  
  // Test 1: Login - try each test user until one works
  console.log(chalk.yellow('\nTesting login with multiple credentials...'));
  
  for (let i = 0; i < TEST_USERS.length; i++) {
    const testUser = TEST_USERS[i];
    try {
      console.log(chalk.gray(`Attempting login with ${testUser.email}...`));
      const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
      
      if (loginResponse.data && loginResponse.data.token && loginResponse.data.user) {
        authToken = loginResponse.data.token;
        userId = loginResponse.data.user.id;
        successfulUser = testUser;
        logResult('Login', true, `Successfully logged in as ${loginResponse.data.user.email}`);
        console.log(chalk.gray(`User ID: ${userId}`));
        console.log(chalk.gray(`User Role: ${loginResponse.data.user.role}`));
        break; // Exit the loop once we have a successful login
      } else {
        logResult(`Login attempt ${i+1}`, false, 'Login response missing token or user data');
      }
    } catch (error) {
      logResult(`Login attempt ${i+1}`, false, `Error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  // If we found valid credentials, save them for future reference
  if (successfulUser) {
    console.log(chalk.green('\nValid admin credentials found:'));
    console.log(chalk.green(`Email: ${successfulUser.email}`));
    console.log(chalk.green(`Password: ${successfulUser.password}`));
  }
  
  // Exit if login failed
  if (!authToken) {
    console.log(chalk.red('\nLogin failed. Cannot continue with other tests.'));
    return;
  }
  
  // Test 2: Get User Role
  try {
    console.log(chalk.yellow('\nTesting get user role...'));
    const roleResponse = await axios.get(
      `${API_URL}/auth/user/${userId}/role`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (roleResponse.data && roleResponse.data.role) {
      logResult('Get User Role', true, `User role: ${roleResponse.data.role}`);
    } else {
      logResult('Get User Role', false, 'Role response missing role data');
    }
  } catch (error) {
    logResult('Get User Role', false, `Error: ${error.response?.data?.message || error.message}`);
  }
  
  // Test 3: Get Current User
  try {
    console.log(chalk.yellow('\nTesting get current user...'));
    const meResponse = await axios.get(
      `${API_URL}/auth/me`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    if (meResponse.data && meResponse.data.id) {
      logResult('Get Current User', true, `Retrieved user data for ${meResponse.data.email}`);
    } else {
      logResult('Get Current User', false, 'User response missing user data');
    }
  } catch (error) {
    logResult('Get Current User', false, `Error: ${error.response?.data?.message || error.message}`);
  }
  
  console.log(chalk.blue('\n=== Authentication Tests Complete ==='));
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('Test script error:'), error);
});
