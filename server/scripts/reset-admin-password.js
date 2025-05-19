/**
 * Reset Admin Password
 * 
 * This script resets the admin user's password in the database
 * to ensure it's properly hashed with argon2.
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

// Admin user credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// Main function
async function main() {
  log.title('Reset Admin Password');
  
  // Create a connection pool for PostgreSQL
  const pool = new Pool({
    host: 'localhost',  // Connect to Docker container via port mapping
    port: 5432,
    database: 'mrp_db',
    user: 'postgres',
    password: 'postgres',
    ssl: false,
    connectionTimeoutMillis: 5000
  });
  
  let client;
  
  try {
    // Test connection
    log.info('Testing database connection...');
    client = await pool.connect();
    log.success('Database connection successful!');
    
    // Check if admin user exists
    log.info(`Checking for admin user (${ADMIN_EMAIL})...`);
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
    
    if (userResult.rows.length === 0) {
      log.error(`Admin user (${ADMIN_EMAIL}) does not exist!`);
      process.exit(1);
    }
    
    // Hash the password with argon2
    log.info('Hashing password with argon2...');
    const hashedPassword = await argon2.hash(ADMIN_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 2**16,
      timeCost: 3,
      parallelism: 1
    });
    
    // Update admin user password
    log.info('Updating admin user password...');
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, ADMIN_EMAIL]
    );
    
    log.success(`Admin user password reset successfully!`);
    log.info(`You can now login with: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    
  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the main function
main().catch(err => {
  log.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
