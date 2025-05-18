/**
 * Create Test Admin Users Script
 * 
 * This script creates test admin users for development purposes
 * in the local PostgreSQL database running in Docker.
 */

import pg from 'pg';
const { Pool } = pg;
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

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

// Database configuration - matches Docker container settings
const dbConfig = {
  host: 'localhost',  // Use localhost since we're connecting from the host machine
  port: 5432,         // Default PostgreSQL port exposed by Docker
  database: 'mrp_db', // Database name from docker-compose.yml
  user: 'postgres',   // Username from docker-compose.yml
  password: 'postgres', // Password from docker-compose.yml
  // Add SSL configuration for Docker connection
  ssl: false
};

// Test users to create
const testUsers = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Administrator',
    name: 'Admin User'
  },
  {
    email: 'manager@example.com',
    password: 'manager123',
    role: 'Manager',
    name: 'Manager User'
  },
  {
    email: 'operator@example.com',
    password: 'operator123',
    role: 'Operator',
    name: 'Operator User'
  }
];

// Create a database connection pool
const pool = new Pool(dbConfig);

// Create a test user
async function createUser(user) {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if user already exists
    const checkResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [user.email.toLowerCase()]
    );
    
    if (checkResult.rows.length > 0) {
      log.warning(`User ${user.email} already exists, skipping...`);
      await client.query('COMMIT');
      return;
    }
    
    // Hash password with argon2
    const hashedPassword = await argon2.hash(user.password, {
      type: argon2.argon2id,
      memoryCost: 2**16,
      timeCost: 3,
      parallelism: 1
    });
    
    // Generate UUID for new user
    const userId = uuidv4();
    
    // Insert user
    await client.query(
      `INSERT INTO users 
       (id, email, password_hash, role, name, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [userId, user.email.toLowerCase(), hashedPassword, user.role, user.name]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    log.success(`Created user: ${user.email} with role: ${user.role}`);
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    log.error(`Failed to create user ${user.email}: ${error.message}`);
    throw error;
  } finally {
    // Release client back to pool
    client.release();
  }
}

// Main function
async function createTestUsers() {
  log.title('Creating Test Admin Users');
  
  try {
    // Check database connection
    const client = await pool.connect();
    log.info('Successfully connected to database');
    client.release();
    
    // Create each test user
    for (const user of testUsers) {
      await createUser(user);
    }
    
    log.success('All test users created successfully');
  } catch (error) {
    log.error(`Database error: ${error.message}`);
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run the script
createTestUsers().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
