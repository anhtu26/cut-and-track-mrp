/**
 * PostgreSQL database setup script for Cut and Track MRP local server
 * This script creates the database and user needed for the application
 */

const { exec } = require('child_process');
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default configuration
const DEFAULT_POSTGRES_HOST = 'localhost';
const DEFAULT_POSTGRES_PORT = 5432;
const DEFAULT_POSTGRES_USER = 'postgres';
const DEFAULT_DATABASE_NAME = 'cut_track_mrp';
const DEFAULT_APP_DB_USER = 'cut_track_user';

// Configuration from ENV or defaults
const config = {
  pgHost: process.env.PG_HOST || DEFAULT_POSTGRES_HOST,
  pgPort: process.env.PG_PORT || DEFAULT_POSTGRES_PORT,
  pgUser: process.env.PG_USER || DEFAULT_POSTGRES_USER,
  pgPassword: process.env.PG_PASSWORD || '',
  dbName: process.env.DB_NAME || DEFAULT_DATABASE_NAME,
  dbUser: process.env.DB_USER || DEFAULT_APP_DB_USER,
  dbPassword: process.env.DB_PASSWORD || ''
};

/**
 * Prompt the user for input with a default value
 * @param {string} question The question to ask the user
 * @param {string} defaultValue The default value if the user enters nothing
 * @returns {Promise<string>} The user input or default value
 */
function prompt(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${question} (${defaultValue}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Execute a shell command and return output
 * @param {string} command The command to execute
 * @returns {Promise<string>} The command output
 */
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
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
 * Test PostgreSQL connection
 * @param {object} connectionConfig Connection parameters
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection(connectionConfig) {
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log('PostgreSQL connection successful!');
    await client.end();
    return true;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    return false;
  }
}

/**
 * Create database and user
 * @param {object} config Configuration parameters
 * @returns {Promise<void>}
 */
async function setupDatabase(config) {
  const adminClient = new Client({
    host: config.pgHost,
    port: config.pgPort,
    user: config.pgUser,
    password: config.pgPassword,
    database: 'postgres' // Connect to default postgres database
  });
  
  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL as admin user');
    
    // Check if database already exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.dbName]
    );
    
    if (dbCheckResult.rows.length === 0) {
      // Create database
      console.log(`Creating database: ${config.dbName}`);
      await adminClient.query(`CREATE DATABASE ${config.dbName}`);
      console.log(`Database ${config.dbName} created successfully`);
    } else {
      console.log(`Database ${config.dbName} already exists`);
    }
    
    // Check if user already exists
    const userCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [config.dbUser]
    );
    
    if (userCheckResult.rows.length === 0) {
      // Create user
      console.log(`Creating user: ${config.dbUser}`);
      await adminClient.query(`CREATE USER ${config.dbUser} WITH ENCRYPTED PASSWORD '${config.dbPassword}'`);
      console.log(`User ${config.dbUser} created successfully`);
    } else {
      console.log(`User ${config.dbUser} already exists`);
      // Update password
      await adminClient.query(`ALTER USER ${config.dbUser} WITH ENCRYPTED PASSWORD '${config.dbPassword}'`);
      console.log(`Updated password for user ${config.dbUser}`);
    }
    
    // Grant privileges to user
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${config.dbName} TO ${config.dbUser}`);
    
    // Connect to the new database to set schema privileges
    await adminClient.end();
    
    // Connect to the new database
    const dbClient = new Client({
      host: config.pgHost,
      port: config.pgPort,
      user: config.pgUser,
      password: config.pgPassword,
      database: config.dbName
    });
    
    await dbClient.connect();
    
    // Grant schema privileges
    await dbClient.query(`GRANT ALL ON SCHEMA public TO ${config.dbUser}`);
    
    // Update the .env file with database configuration
    updateEnvFile(config);
    
    console.log('Database setup completed successfully!');
    await dbClient.end();
    
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    try {
      await adminClient.end();
    } catch (err) {
      // Ignore errors on close
    }
  }
}

/**
 * Update .env file with database configuration
 * @param {object} config Configuration parameters
 */
function updateEnvFile(config) {
  const envPath = path.resolve(__dirname, '../.env');
  const envExamplePath = path.resolve(__dirname, '../.env.example');
  
  // If .env doesn't exist, copy from .env.example
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
  }
  
  // Read current .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update database configuration
  const envVars = {
    DB_HOST: config.pgHost,
    DB_PORT: config.pgPort,
    DB_NAME: config.dbName,
    DB_USER: config.dbUser,
    DB_PASSWORD: config.dbPassword
  };
  
  // Update or add each environment variable
  for (const [key, value] of Object.entries(envVars)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (envContent.match(regex)) {
      // Update existing value
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new value
      envContent += `\n${key}=${value}`;
    }
  }
  
  // Write updated content to .env file
  fs.writeFileSync(envPath, envContent);
  console.log('.env file updated with database configuration');
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Cut and Track MRP Database Setup');
    console.log('===============================');
    
    // Get database configuration from user
    config.pgHost = await prompt('PostgreSQL server host', config.pgHost);
    config.pgPort = await prompt('PostgreSQL server port', config.pgPort);
    config.pgUser = await prompt('PostgreSQL admin username', config.pgUser);
    config.pgPassword = await prompt('PostgreSQL admin password', config.pgPassword);
    config.dbName = await prompt('Database name to create', config.dbName);
    config.dbUser = await prompt('Application database user to create', config.dbUser);
    config.dbPassword = await prompt('Application database user password', config.dbPassword || 'cut_track_pass');
    
    // Test PostgreSQL connection
    const connectionSuccess = await testConnection({
      host: config.pgHost,
      port: config.pgPort,
      user: config.pgUser,
      password: config.pgPassword,
      database: 'postgres' // Default database
    });
    
    if (!connectionSuccess) {
      console.error('Could not connect to PostgreSQL server. Please check your configuration.');
      process.exit(1);
    }
    
    // Setup database and user
    await setupDatabase(config);
    
    console.log('\nDatabase setup completed successfully!');
    console.log(`You can now use the following connection string: postgres://${config.dbUser}:${config.dbPassword}@${config.pgHost}:${config.pgPort}/${config.dbName}`);
    
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupDatabase, testConnection };
