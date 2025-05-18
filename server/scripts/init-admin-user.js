/**
 * Initialize Admin User
 * 
 * This script creates an admin user in the database with the correct schema.
 * It uses Argon2 for password hashing as per the requirements.
 */

require('dotenv').config();
const { Pool } = require('pg');
const argon2 = require('argon2');
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

// Admin user credentials
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'admin123',
  role: 'Administrator',
  first_name: 'Admin',
  last_name: 'User'
};

// Main function
async function main() {
  log.title('Initialize Admin User');
  
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
    log.info(`Checking for admin user (${ADMIN_USER.email})...`);
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [ADMIN_USER.email]);
    
    if (userResult.rows.length > 0) {
      log.warning(`Admin user (${ADMIN_USER.email}) already exists`);
      log.info('Updating admin user...');
      
      // Hash the password with argon2
      const passwordHash = await argon2.hash(ADMIN_USER.password, {
        type: argon2.argon2id,
        memoryCost: 2**16,
        timeCost: 3,
        parallelism: 1
      });
      
      // Update admin user
      await client.query(
        `UPDATE users 
         SET password_hash = $1, 
             role = $2,
             first_name = $3,
             last_name = $4
         WHERE email = $5`,
        [
          passwordHash,
          ADMIN_USER.role,
          ADMIN_USER.first_name,
          ADMIN_USER.last_name,
          ADMIN_USER.email
        ]
      );
      
      log.success('Admin user updated successfully!');
    } else {
      log.info('Creating new admin user...');
      
      // Hash the password with argon2
      const passwordHash = await argon2.hash(ADMIN_USER.password, {
        type: argon2.argon2id,
        memoryCost: 2**16,
        timeCost: 3,
        parallelism: 1
      });
      
      // Insert new admin user
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          uuidv4(),
          ADMIN_USER.email,
          passwordHash,
          ADMIN_USER.role,
          ADMIN_USER.first_name,
          ADMIN_USER.last_name
        ]
      );
      
      log.success('Admin user created successfully!');
    }
    
    log.info(`Admin user credentials: ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
    log.warning('IMPORTANT: Change the default admin password in production!');
    
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
