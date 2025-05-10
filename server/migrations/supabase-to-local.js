/**
 * Migration script to transfer data from Supabase to local PostgreSQL database
 * This script reads the SQL backup files and processes them for the local database
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cut_track_mrp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true'
};

// File paths
const SCHEMA_BACKUP_PATH = path.resolve(__dirname, '../../local/schema_backup.sql');
const DATA_BACKUP_PATH = path.resolve(__dirname, '../../local/data_backup.sql');
const LOCAL_SCHEMA_PATH = path.resolve(__dirname, '../db/schema.sql');

// Create database connection pool
const pool = new Pool(dbConfig);

/**
 * Execute a SQL command using the psql CLI
 * @param {string} sqlFile - Path to SQL file
 * @returns {Promise<void>}
 */
function executeSqlFile(sqlFile) {
  return new Promise((resolve, reject) => {
    const command = `psql -U ${dbConfig.user} -d ${dbConfig.database} -f "${sqlFile}"`;
    
    console.log(`Executing: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing SQL file: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`SQL warnings: ${stderr}`);
      }
      console.log(`SQL output: ${stdout}`);
      resolve();
    });
  });
}

/**
 * Import Supabase users to local users table with proper password hashing
 * @returns {Promise<void>}
 */
async function migrateUsers() {
  try {
    console.log('Starting user migration...');
    
    // Get Supabase users from auth.users table
    const { rows: supabaseUsers } = await pool.query(`
      SELECT id, email, encrypted_password, created_at, updated_at
      FROM auth.users
      WHERE NOT is_anonymous
    `);
    
    console.log(`Found ${supabaseUsers.length} users to migrate`);
    
    // Check if local users table exists, create if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Staff',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Migrate each user
    for (const user of supabaseUsers) {
      // Check if user already exists in local database
      const { rows: existingUsers } = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );
      
      if (existingUsers.length > 0) {
        console.log(`User ${user.email} already exists in local database, skipping`);
        continue;
      }
      
      // Use existing password hash from Supabase (bcrypt compatible)
      // Let's default first user to Administrator and others to Staff
      const role = user.email.includes('admin') ? 'Administrator' : 'Staff';
      
      await pool.query(
        `INSERT INTO users (id, email, password, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          user.email,
          user.encrypted_password, // Already hashed with bcrypt in Supabase
          role,
          user.created_at,
          user.updated_at || user.created_at
        ]
      );
      
      console.log(`Migrated user: ${user.email} with role ${role}`);
    }
    
    console.log('User migration completed successfully');
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  let client;
  
  try {
    console.log('Starting migration from Supabase to local PostgreSQL...');
    
    // 1. Connect to database
    client = await pool.connect();
    console.log('Connected to database');
    
    // 2. Import schema from backup
    console.log('Importing schema from backup...');
    await executeSqlFile(SCHEMA_BACKUP_PATH);
    
    // 3. Import data from backup
    console.log('Importing data from backup...');
    await executeSqlFile(DATA_BACKUP_PATH);
    
    // 4. Import local schema additions (users, documents tables, etc.)
    console.log('Importing local schema additions...');
    await executeSqlFile(LOCAL_SCHEMA_PATH);
    
    // 5. Migrate users from auth.users to local users table
    await migrateUsers();
    
    // 6. Migration complete
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrate().catch(err => {
    console.error('Unhandled error during migration:', err);
    process.exit(1);
  });
}

module.exports = { migrate };
