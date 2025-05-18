/**
 * Docker Authentication Test
 * 
 * This script tests the authentication system specifically with the Docker setup.
 * It connects directly to the PostgreSQL container and tests the API endpoints.
 * Updated to work with the password_hash field instead of password.
 */

require('dotenv').config();
const { Pool } = require('pg');
const argon2 = require('argon2');

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

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mrp_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? true : false,
  connectionTimeoutMillis: 5000
});

// Test database connection
async function testDatabaseConnection() {
  log.title('Testing Database Connection');
  
  try {
    const client = await pool.connect();
    log.success('Connected to PostgreSQL database!');
    
    // Check database schema version
    const schemaResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
      );
    `);
    
    if (schemaResult.rows[0].exists) {
      log.success('Schema is updated: password_hash column exists in users table');
    } else {
      log.error('Schema is outdated: password_hash column does not exist in users table');
      log.info('Please run the migration scripts to update the database schema');
      client.release();
      return false;
    }
    
    client.release();
    return true;
  } catch (error) {
    log.error(`Database connection error: ${error.message}`);
    return false;
  }
}

// Test authentication against database
async function testAuthentication() {
  log.title('Testing Authentication');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  for (const user of TEST_USERS) {
    log.info(`Testing user: ${user.email}`);
    
    try {
      // Get user from database with updated schema
      const result = await pool.query(
        'SELECT id, email, password_hash, role FROM users WHERE email = $1',
        [user.email]
      );
      
      if (result.rows.length === 0) {
        log.error(`User ${user.email} not found in database`);
        testsFailed++;
        continue;
      }
      
      const dbUser = result.rows[0];
      log.info(`Found user with ID: ${dbUser.id}`);
      
      // Verify password using password_hash
      if (!dbUser.password_hash) {
        log.error(`User ${user.email} has no password_hash set`);
        testsFailed++;
        continue;
      }
      
      // Verify password using argon2
      try {
        const match = await argon2.verify(dbUser.password_hash, user.password);
        
        if (!match) {
          log.error(`Password verification failed for ${user.email}`);
          testsFailed++;
          continue;
        }
        
        log.success(`Password verification successful for ${user.email}`);
      } catch (verifyError) {
        log.error(`Error verifying password: ${verifyError.message}`);
        testsFailed++;
        continue;
      }
      
      // Verify role
      if (dbUser.role !== user.expectedRole) {
        log.error(`Role verification failed for ${user.email}. Expected ${user.expectedRole}, got ${dbUser.role}`);
        testsFailed++;
        continue;
      }
      
      log.success(`Authentication successful for ${user.email} with role ${dbUser.role}`);
      testsPassed++;
    } catch (error) {
      log.error(`Error testing authentication for ${user.email}: ${error.message}`);
      testsFailed++;
    }
  }
  
  log.title('Authentication Test Results');
  log.info(`Tests passed: ${testsPassed}/${TEST_USERS.length}`);
  
  if (testsFailed > 0) {
    log.error(`${testsFailed} tests failed`);
    return false;
  }
  
  log.success('All authentication tests passed!');
  return true;
}

// Run all tests
async function runTests() {
  let testsFailed = 0;
  
  if (!(await testDatabaseConnection())) {
    testsFailed++;
  }
  
  if (!(await testAuthentication())) {
    testsFailed++;
  }
  
  // Close pool
  await pool.end();
  
  // Return test results
  return testsFailed === 0;
}

// Main function
async function main() {
  log.title('Docker Authentication Test');
  log.info('Testing authentication with updated password_hash field');
  
  try {
    const success = await runTests();
    
    if (success) {
      log.title('Final Results');
      log.success('All tests passed successfully!');
      log.info('Authentication system is working correctly with Docker environment.');
      process.exit(0);
    } else {
      log.title('Final Results');
      log.error('Some tests failed!');
      log.info('Please check the logs above for details on what failed.');
      process.exit(1);
    }
  } catch (error) {
    log.error(`Unhandled error: ${error.message}`);
    log.error('Test execution failed unexpectedly');
    process.exit(1);
  }
}

// Call the main function
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
const API_URL = process.env.API_URL || 'http://localhost:3002';

// Connect to PostgreSQL in Docker
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost', // Connect to Docker container via port mapping
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mrp_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? true : false,
  // Add connection timeout to fail fast if database is unreachable
  connectionTimeoutMillis: 5000
});

// Test database connection
async function testDatabaseConnection() {
  log.title('Testing Database Connection');
  
  try {
    const client = await pool.connect();
    log.success('Connected to PostgreSQL database!');
    
    // Check database schema version
    const schemaResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
      );
    `);
    
    if (schemaResult.rows[0].exists) {
      log.success('Schema is updated: password_hash column exists in users table');
    } else {
      log.error('Schema is outdated: password_hash column does not exist in users table');
      log.info('Please run the migration scripts to update the database schema');
      client.release();
      return false;
    }
    
    client.release();
    return true;
  } catch (error) {
    log.error(`Database connection error: ${error.message}`);
    return false;
  }
}

// Test authentication against database
async function testAuthentication() {
  log.title('Testing Authentication');
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  for (const user of TEST_USERS) {
    log.info(`Testing user: ${user.email}`);
    
    try {
      // Get user from database with updated schema
      const result = await pool.query(
        'SELECT id, email, password_hash, role FROM users WHERE email = $1',
        [user.email]
      );
      
      if (result.rows.length === 0) {
        log.error(`User ${user.email} not found in database`);
        testsFailed++;
        continue;
      }
      
      const dbUser = result.rows[0];
      log.info(`Found user with ID: ${dbUser.id}`);
      
      // Verify password using password_hash
      if (!dbUser.password_hash) {
        log.error(`User ${user.email} has no password_hash set`);
        testsFailed++;
        continue;
      }
      
      // Verify password using argon2
      try {
        const match = await argon2.verify(dbUser.password_hash, user.password);
        
        if (!match) {
          log.error(`Password verification failed for ${user.email}`);
          testsFailed++;
          continue;
        }
        
        log.success(`Password verification successful for ${user.email}`);
      } catch (verifyError) {
        log.error(`Error verifying password: ${verifyError.message}`);
        testsFailed++;
        continue;
      }
      
      // Verify role
      if (dbUser.role !== user.expectedRole) {
        log.error(`Role verification failed for ${user.email}. Expected ${user.expectedRole}, got ${dbUser.role}`);
        testsFailed++;
        continue;
      }
      
      log.success(`Authentication successful for ${user.email} with role ${dbUser.role}`);
      testsPassed++;
    } catch (error) {
      log.error(`Error testing authentication for ${user.email}: ${error.message}`);
      testsFailed++;
    }
  }
  
  log.title('Authentication Test Results');
  log.info(`Tests passed: ${testsPassed}/${TEST_USERS.length}`);
  
  if (testsFailed > 0) {
    log.error(`${testsFailed} tests failed`);
    return false;
  }
  
  log.success('All authentication tests passed!');
  return true;
}

// Run tests
async function testAuth() {
  let testsFailed = 0;
  
  if (!(await testDatabaseConnection())) {
    testsFailed++;
  }
  
  if (!(await testAuthentication())) {
    testsFailed++;
  }
  
  // Close pool
  await pool.end();
  
  // Return test results
  return testsFailed === 0;
}

// Main function
async function main() {
  log.title('Docker Authentication Test');
  log.info('Testing authentication with updated password_hash field');
  
  try {
    const success = await testAuth();
    
    if (success) {
      log.title('Final Results');
      log.success('All tests passed successfully!');
      log.info('Authentication system is working correctly with Docker environment.');
      process.exit(0);
    } else {
      log.title('Final Results');
      log.error('Some tests failed!');
      log.info('Please check the logs above for details on what failed.');
      process.exit(1);
    }
  } catch (error) {
    log.error(`Unhandled error: ${error.message}`);
    log.error('Test execution failed unexpectedly');
    process.exit(1);
  }
}

// Call the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
}

// Run tests
testAuth().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
