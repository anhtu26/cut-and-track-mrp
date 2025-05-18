/**
 * Docker Database Initialization
 * 
 * This script initializes the database tables for the authentication system
 * specifically for the Docker environment.
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

// Default admin user
const defaultAdmin = {
  id: uuidv4(),
  email: 'admin@example.com',
  password: 'admin123',
  role: 'Administrator'
};

// SQL to create authentication tables
const createUserTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const createSessionTableSQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sessions_token UNIQUE (token)
  );
`;

// Main function
async function main() {
  log.title('Docker Database Initialization');
  
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
    
    // Create users table
    log.info('Creating users table...');
    await client.query(createUserTableSQL);
    log.success('Users table created or already exists');
    
    // Create sessions table
    log.info('Creating sessions table...');
    await client.query(createSessionTableSQL);
    log.success('Sessions table created or already exists');
    
    // Check if admin user exists
    log.info('Checking for admin user...');
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [defaultAdmin.email]);
    
    if (userResult.rows.length > 0) {
      log.warning(`Admin user (${defaultAdmin.email}) already exists, skipping creation`);
    } else {
      // Create admin user
      log.info('Creating default admin user...');
      
      // Hash the password with argon2
      const hashedPassword = await argon2.hash(defaultAdmin.password, {
        type: argon2.argon2id,
        memoryCost: 2**16,
        timeCost: 3,
        parallelism: 1
      });
      
      // Insert the user
      await client.query(
        `INSERT INTO users (id, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        [
          defaultAdmin.id,
          defaultAdmin.email,
          hashedPassword,
          defaultAdmin.role
        ]
      );
      
      log.success(`Admin user created with email: ${defaultAdmin.email} and password: ${defaultAdmin.password}`);
      log.warning('IMPORTANT: Change the default admin password in production!');
    }
    
    log.title('Database Initialization Complete');
    log.info('You can now start the server and use the authentication system');
    log.info(`Login with: ${defaultAdmin.email} / ${defaultAdmin.password}`);
    
  } catch (error) {
    log.error(`Database initialization error: ${error.message}`);
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
