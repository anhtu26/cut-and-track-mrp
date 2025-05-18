/**
 * Docker Setup Checker
 * 
 * This script checks if Docker containers are running properly and tests connections
 * to the database and API server within the Docker environment.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fetch = require('node-fetch');

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

// Check Docker containers
async function checkDockerContainers() {
  log.title('Checking Docker Containers');
  
  try {
    // Try to connect to PostgreSQL (Docker)
    log.info('Testing PostgreSQL connection (Docker)...');
    
    const dockerPool = new Pool({
      host: 'localhost', // Connect to Docker-exposed port
      port: 5432,
      database: 'mrp_db',
      user: 'postgres',
      password: 'postgres',
      ssl: false,
      connectionTimeoutMillis: 5000
    });
    
    const client = await dockerPool.connect();
    log.success('PostgreSQL Docker container is running and accessible!');
    
    // Test a simple query
    const result = await client.query('SELECT current_timestamp');
    log.info(`Database time: ${result.rows[0].current_timestamp}`);
    
    client.release();
    await dockerPool.end();
    
    return true;
  } catch (error) {
    log.error(`PostgreSQL Docker connection failed: ${error.message}`);
    log.info('Make sure the Docker containers are running with:');
    log.info('  docker-compose up -d');
    return false;
  }
}

// Check API server
async function checkApiServer() {
  log.title('Checking API Server');
  
  try {
    // Try to connect to API server
    log.info('Testing API server connection...');
    
    const response = await fetch('http://localhost:3002/');
    
    if (response.ok) {
      log.success('API server is running and accessible!');
      return true;
    } else {
      log.error(`API server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    log.error(`API server connection failed: ${error.message}`);
    log.info('Make sure the API server container is running with:');
    log.info('  docker-compose up -d');
    return false;
  }
}

// Main function
async function main() {
  log.title('Docker Setup Checker');
  
  // Check Docker containers
  const containersRunning = await checkDockerContainers();
  
  if (!containersRunning) {
    log.error('Docker containers check failed. Please start Docker containers first.');
    log.info('Run: docker-compose up -d');
    process.exit(1);
  }
  
  // Check API server
  const apiServerRunning = await checkApiServer();
  
  if (!apiServerRunning) {
    log.error('API server check failed. Please make sure the API server is running.');
    process.exit(1);
  }
  
  log.title('Docker Setup Check Complete');
  log.success('All Docker services are running correctly!');
  log.info('You can now proceed with authentication system setup and testing.');
}

// Run the main function
main().catch(err => {
  log.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
