/**
 * Check Database Schema
 * 
 * This script connects to the database and checks the schema and user data
 * to help debug authentication issues.
 */

require('dotenv').config();
const { Pool } = require('pg');

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

// Main function
async function main() {
  log.title('Database Schema Check');
  
  // Create a connection pool for PostgreSQL
  const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'mrp_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    ssl: process.env.DB_SSL === 'true' ? true : false
  });
  
  let client;
  
  try {
    // Test connection
    log.info('Testing database connection...');
    client = await pool.connect();
    log.success('Database connection successful!');
    
    // Check users table schema
    log.info('Checking users table schema...');
    const schemaResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    log.success(`Users table has ${schemaResult.rows.length} columns:`);
    schemaResult.rows.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type}${column.character_maximum_length ? `(${column.character_maximum_length})` : ''}`);
    });
    
    // Check admin user
    log.info('Checking admin user...');
    const adminResult = await client.query(`
      SELECT id, email, role, first_name, last_name
      FROM users
      WHERE email = 'admin@example.com';
    `);
    
    if (adminResult.rows.length === 0) {
      log.error('Admin user not found!');
    } else {
      const admin = adminResult.rows[0];
      log.success('Admin user found:');
      console.log(`  - ID: ${admin.id}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Role: ${admin.role}`);
      console.log(`  - Name: ${admin.first_name} ${admin.last_name}`);
      
      // Check password hash
      const passwordResult = await client.query(`
        SELECT password_hash
        FROM users
        WHERE email = 'admin@example.com';
      `);
      
      if (passwordResult.rows[0].password_hash) {
        log.success('Password hash exists');
        console.log(`  - Hash: ${passwordResult.rows[0].password_hash.substring(0, 20)}...`);
      } else {
        log.error('Password hash is missing!');
      }
    }
    
    // Check all users
    log.info('Listing all users...');
    const usersResult = await client.query(`
      SELECT id, email, role
      FROM users
      ORDER BY email;
    `);
    
    log.success(`Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
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
