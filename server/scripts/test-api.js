/**
 * Cut and Track MRP - API Test Script
 * 
 * This script tests the functionality of the local API server
 * to verify that the migration from Supabase was successful.
 */

const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};
let authToken = '';
let testCustomerId = '';
let testPartId = '';
let testWorkOrderId = '';
let testOperationId = '';
let testFileId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Run a test function and log the result
 * @param {string} testName Name of the test
 * @param {Function} testFn Test function to run
 */
async function runTest(testName, testFn) {
  try {
    console.log(`${colors.blue}Running test: ${testName}${colors.reset}`);
    const startTime = Date.now();
    await testFn();
    const endTime = Date.now();
    console.log(`${colors.green}✓ Passed: ${testName} (${endTime - startTime}ms)${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed: ${testName}${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    if (error.response) {
      console.error(`${colors.red}Status: ${error.response.status}${colors.reset}`);
      console.error(`${colors.red}Data: ${JSON.stringify(error.response.data, null, 2)}${colors.reset}`);
    }
    return false;
  }
}

/**
 * Test user registration
 */
async function testUserRegistration() {
  const userData = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    role: 'Staff'
  };
  
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  
  if (!response.data.token) {
    throw new Error('Registration failed: No token returned');
  }
  
  console.log(`${colors.yellow}Created test user: ${userData.email}${colors.reset}`);
}

/**
 * Test user login
 */
async function testUserLogin() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
  
  if (!response.data.token) {
    throw new Error('Login failed: No token returned');
  }
  
  authToken = response.data.token;
  console.log(`${colors.yellow}User logged in successfully${colors.reset}`);
}

/**
 * Test customer CRUD operations
 */
async function testCustomerOperations() {
  // Create customer
  const customerData = {
    name: `Test Customer ${Date.now()}`,
    contact_name: 'Test Contact',
    contact_email: 'test@example.com',
    contact_phone: '555-1234',
  };
  
  const createResponse = await axios.post(`${API_URL}/customers`, customerData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  testCustomerId = createResponse.data.id;
  console.log(`${colors.yellow}Created test customer: ${testCustomerId}${colors.reset}`);
  
  // Get customer
  const getResponse = await axios.get(`${API_URL}/customers/${testCustomerId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (getResponse.data.name !== customerData.name) {
    throw new Error('Get customer failed: Incorrect data returned');
  }
  
  // Update customer
  const updateData = { name: `Updated Customer ${Date.now()}` };
  const updateResponse = await axios.put(`${API_URL}/customers/${testCustomerId}`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (updateResponse.data.name !== updateData.name) {
    throw new Error('Update customer failed: Data not updated correctly');
  }
  
  // List customers
  const listResponse = await axios.get(`${API_URL}/customers`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (!Array.isArray(listResponse.data)) {
    throw new Error('List customers failed: Expected array response');
  }
}

/**
 * Test part CRUD operations
 */
async function testPartOperations() {
  // Create part
  const partData = {
    part_number: `PART-${Date.now()}`,
    name: `Test Part ${Date.now()}`,
    description: 'Test part description',
    customer_id: testCustomerId,
    status: 'active',
  };
  
  const createResponse = await axios.post(`${API_URL}/parts`, partData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  testPartId = createResponse.data.id;
  console.log(`${colors.yellow}Created test part: ${testPartId}${colors.reset}`);
  
  // Get part
  const getResponse = await axios.get(`${API_URL}/parts/${testPartId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (getResponse.data.part_number !== partData.part_number) {
    throw new Error('Get part failed: Incorrect data returned');
  }
  
  // Update part
  const updateData = { description: `Updated description ${Date.now()}` };
  const updateResponse = await axios.put(`${API_URL}/parts/${testPartId}`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (updateResponse.data.description !== updateData.description) {
    throw new Error('Update part failed: Data not updated correctly');
  }
  
  // List parts
  const listResponse = await axios.get(`${API_URL}/parts`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (!Array.isArray(listResponse.data)) {
    throw new Error('List parts failed: Expected array response');
  }
}

/**
 * Test operation CRUD operations
 */
async function testOperationOperations() {
  // Create operation
  const operationData = {
    name: `Test Operation ${Date.now()}`,
    description: 'Test operation description',
    standard_time: 60,
  };
  
  const createResponse = await axios.post(`${API_URL}/operations`, operationData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  testOperationId = createResponse.data.id;
  console.log(`${colors.yellow}Created test operation: ${testOperationId}${colors.reset}`);
  
  // Get operation
  const getResponse = await axios.get(`${API_URL}/operations/${testOperationId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (getResponse.data.name !== operationData.name) {
    throw new Error('Get operation failed: Incorrect data returned');
  }
  
  // Update operation
  const updateData = { description: `Updated description ${Date.now()}` };
  const updateResponse = await axios.put(`${API_URL}/operations/${testOperationId}`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (updateResponse.data.description !== updateData.description) {
    throw new Error('Update operation failed: Data not updated correctly');
  }
  
  // List operations
  const listResponse = await axios.get(`${API_URL}/operations`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (!Array.isArray(listResponse.data)) {
    throw new Error('List operations failed: Expected array response');
  }
}

/**
 * Test work order CRUD operations
 */
async function testWorkOrderOperations() {
  // Create work order
  const workOrderData = {
    order_number: `WO-${Date.now()}`,
    description: 'Test work order',
    customer_id: testCustomerId,
    part_id: testPartId,
    quantity: 10,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'open',
  };
  
  const createResponse = await axios.post(`${API_URL}/workorders`, workOrderData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  testWorkOrderId = createResponse.data.id;
  console.log(`${colors.yellow}Created test work order: ${testWorkOrderId}${colors.reset}`);
  
  // Get work order
  const getResponse = await axios.get(`${API_URL}/workorders/${testWorkOrderId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (getResponse.data.order_number !== workOrderData.order_number) {
    throw new Error('Get work order failed: Incorrect data returned');
  }
  
  // Update work order
  const updateData = { description: `Updated description ${Date.now()}` };
  const updateResponse = await axios.put(`${API_URL}/workorders/${testWorkOrderId}`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (updateResponse.data.description !== updateData.description) {
    throw new Error('Update work order failed: Data not updated correctly');
  }
  
  // List work orders
  const listResponse = await axios.get(`${API_URL}/workorders`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  if (!Array.isArray(listResponse.data)) {
    throw new Error('List work orders failed: Expected array response');
  }
}

/**
 * Test file storage operations
 */
async function testFileStorageOperations() {
  // Create a test file
  const testFilePath = path.resolve(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, `Test file content ${Date.now()}`);
  
  // Upload file
  const formData = new FormData();
  formData.append('file', fs.createReadStream(testFilePath));
  formData.append('entityType', 'test');
  formData.append('entityId', uuidv4());
  
  const uploadResponse = await axios.post(`${API_URL}/storage/upload`, formData, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  testFileId = uploadResponse.data.fileId;
  console.log(`${colors.yellow}Uploaded test file: ${testFileId}${colors.reset}`);
  
  // Download file
  const downloadResponse = await axios.get(`${API_URL}/storage/download/${testFileId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
    responseType: 'arraybuffer'
  });
  
  if (!downloadResponse.data) {
    throw new Error('Download file failed: No data returned');
  }
  
  // Clean up
  fs.unlinkSync(testFilePath);
  console.log(`${colors.yellow}Cleaned up test file${colors.reset}`);
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.blue}Starting API tests for Cut and Track MRP Local Server${colors.reset}`);
  console.log('=====================================================');
  
  const testResults = [];
  
  // Phase 1: Authentication tests
  console.log(`\n${colors.blue}Phase 1: Authentication Tests${colors.reset}`);
  testResults.push(await runTest('User Registration', testUserRegistration));
  testResults.push(await runTest('User Login', testUserLogin));
  
  // Skip remaining tests if auth failed
  if (!authToken) {
    console.error(`${colors.red}Authentication failed, skipping remaining tests${colors.reset}`);
    process.exit(1);
  }
  
  // Phase 2: Data operations tests
  console.log(`\n${colors.blue}Phase 2: Data Operations Tests${colors.reset}`);
  testResults.push(await runTest('Customer Operations', testCustomerOperations));
  testResults.push(await runTest('Part Operations', testPartOperations));
  testResults.push(await runTest('Operation Operations', testOperationOperations));
  testResults.push(await runTest('Work Order Operations', testWorkOrderOperations));
  
  // Phase 3: File storage tests
  console.log(`\n${colors.blue}Phase 3: File Storage Tests${colors.reset}`);
  testResults.push(await runTest('File Storage Operations', testFileStorageOperations));
  
  // Results summary
  console.log('\n=====================================================');
  console.log(`${colors.blue}Test Summary:${colors.reset}`);
  const passed = testResults.filter(r => r).length;
  const failed = testResults.filter(r => !r).length;
  const total = testResults.length;
  const passRate = Math.round((passed / total) * 100);
  
  console.log(`${colors.blue}Total Tests: ${total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed} (${passRate}%)${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}Failed: ${failed} (${100 - passRate}%)${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All tests passed successfully!${colors.reset}`);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error(`${colors.red}Unhandled error during tests:${colors.reset}`, error);
  process.exit(1);
});
