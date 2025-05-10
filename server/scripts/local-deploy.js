/**
 * Cut and Track MRP - Local Deployment Script
 * 
 * This script handles local deployment of the application,
 * including database setup, migrations, and server startup.
 */

const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define paths
const SERVER_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(SERVER_DIR, '..');
const UPLOADS_DIR = path.resolve(SERVER_DIR, 'uploads');
const DB_SETUP_SCRIPT = path.resolve(__dirname, 'db-setup.js');
const MIGRATION_SCRIPT = path.resolve(SERVER_DIR, 'migrations', 'supabase-to-local.js');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Execute a command and return promise
 * @param {string} cmd Command to execute
 * @param {string} cwd Working directory
 * @returns {Promise<string>} Command output
 */
function execPromise(cmd, cwd = ROOT_DIR) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${cmd}`);
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`Warning: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

/**
 * Prompt user for confirmation
 * @param {string} question Question to ask
 * @returns {Promise<boolean>} True if confirmed
 */
async function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Create required directories
 */
async function createDirectories() {
  console.log('Creating necessary directories...');
  
  // Create uploads directory
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Created uploads directory at ${UPLOADS_DIR}`);
  } else {
    console.log(`Uploads directory already exists at ${UPLOADS_DIR}`);
  }
  
  // Create subdirectories for different entity types
  const subDirs = ['parts', 'workorders', 'customers', 'other'];
  for (const dir of subDirs) {
    const subDir = path.join(UPLOADS_DIR, dir);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
      console.log(`Created subdirectory: ${subDir}`);
    }
  }
}

/**
 * Setup database
 */
async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Check if database setup script exists
    if (!fs.existsSync(DB_SETUP_SCRIPT)) {
      throw new Error(`Database setup script not found at ${DB_SETUP_SCRIPT}`);
    }
    
    // Run database setup script
    const confirmed = await confirm('Do you want to set up the database?');
    if (!confirmed) {
      console.log('Skipping database setup.');
      return;
    }
    
    await execPromise(`node ${DB_SETUP_SCRIPT}`, SERVER_DIR);
    console.log('Database setup completed.');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    throw error;
  }
}

/**
 * Run migrations
 */
async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Check if migration script exists
    if (!fs.existsSync(MIGRATION_SCRIPT)) {
      throw new Error(`Migration script not found at ${MIGRATION_SCRIPT}`);
    }
    
    // Run migration script
    const confirmed = await confirm('Do you want to run data migrations from Supabase?');
    if (!confirmed) {
      console.log('Skipping migrations.');
      return;
    }
    
    await execPromise(`node ${MIGRATION_SCRIPT}`, SERVER_DIR);
    console.log('Migrations completed.');
  } catch (error) {
    console.error('Migrations failed:', error.message);
    throw error;
  }
}

/**
 * Start server
 */
async function startServer() {
  console.log('Starting server...');
  
  try {
    const serverProcess = spawn('node', ['index.js'], {
      cwd: SERVER_DIR,
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (error) => {
      console.error('Server failed to start:', error.message);
    });
    
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Server exited with code ${code}`);
      }
    });
    
    console.log('Server started. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Failed to start server:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Cut and Track MRP Local Deployment');
    console.log('==================================');
    
    // Create directories
    await createDirectories();
    
    // Setup database
    await setupDatabase();
    
    // Run migrations
    await runMigrations();
    
    // Start server
    await startServer();
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().finally(() => {
    // Keep readline open because server is running
  });
}

module.exports = { main, setupDatabase, runMigrations, startServer };
