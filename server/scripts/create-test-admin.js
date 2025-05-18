/**
 * Create Test Admin User Script
 * 
 * This script creates a test admin user in the local database
 * for testing the authentication system.
 */

const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const chalk = require('chalk');

// Test admin user details
const TEST_ADMIN = {
  email: 'admin@cutandtrack.local',
  password: 'admin123',
  role: 'Administrator'
};

async function createTestAdmin() {
  try {
    console.log(chalk.blue('=== Creating Test Admin User ==='));
    
    // Check if user already exists
    const userCheck = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [TEST_ADMIN.email.toLowerCase()]
    );
    
    if (userCheck.rows.length > 0) {
      console.log(chalk.yellow(`User ${TEST_ADMIN.email} already exists.`));
      console.log(chalk.green('Test admin credentials:'));
      console.log(chalk.green(`Email: ${TEST_ADMIN.email}`));
      console.log(chalk.green(`Password: ${TEST_ADMIN.password}`));
      return;
    }
    
    // Hash password with argon2
    const hashedPassword = await argon2.hash(TEST_ADMIN.password, {
      type: argon2.argon2id,  // Most secure variant
      memoryCost: 2**16,      // 64 MiB memory usage
      timeCost: 3,            // 3 iterations
      parallelism: 1          // 1 thread
    });
    
    // Generate UUID for new user
    const userId = uuidv4();
    
    // Create user
    const result = await db.query(
      `INSERT INTO users 
       (id, email, password_hash, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, role, created_at`,
      [userId, TEST_ADMIN.email.toLowerCase(), hashedPassword, TEST_ADMIN.role]
    );
    
    console.log(chalk.green('Test admin user created successfully:'));
    console.log(chalk.green(`ID: ${result.rows[0].id}`));
    console.log(chalk.green(`Email: ${result.rows[0].email}`));
    console.log(chalk.green(`Role: ${result.rows[0].role}`));
    console.log(chalk.green(`Password: ${TEST_ADMIN.password}`));
  } catch (error) {
    console.error(chalk.red('Error creating test admin user:'), error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the script
createTestAdmin();
