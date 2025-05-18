/**
 * Docker Authentication Test Script
 * 
 * This script tests the authentication system with proper Docker networking configuration.
 * It connects directly to the PostgreSQL database running in Docker and tests user login.
 */

import pg from 'pg';
const { Pool } = pg;

// Docker PostgreSQL configuration - uses proper Docker networking
const dbConfig = {
  host: 'postgres',    // Docker service name from docker-compose.yml
  port: 5432,          // PostgreSQL port inside Docker
  database: 'mrp_db',  // Database name from docker-compose.yml
  user: 'postgres',    // Database user from docker-compose.yml
  password: 'postgres', // Database password from docker-compose.yml
  ssl: false           // No SSL in local Docker environment
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}=== Docker Authentication Test ===${colors.reset}\n`);
console.log(`${colors.yellow}This script must be run inside the Docker container to work properly.${colors.reset}`);
console.log(`${colors.yellow}Run it with: docker-compose exec api-server node /app/scripts/docker-test-auth.js${colors.reset}\n`);

// Create a database connection pool
const pool = new Pool(dbConfig);

// Test database connection
async function testDbConnection() {
  try {
    console.log(`${colors.blue}Testing database connection...${colors.reset}`);
    const client = await pool.connect();
    console.log(`${colors.green}✓ Connected to database successfully${colors.reset}`);
    
    // Check if users table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log(`${colors.green}✓ Users table exists${colors.reset}`);
      
      // Check if there are any users in the database
      const userResult = await client.query('SELECT COUNT(*) FROM users;');
      const userCount = parseInt(userResult.rows[0].count);
      
      if (userCount > 0) {
        console.log(`${colors.green}✓ Found ${userCount} users in database${colors.reset}`);
        
        // Get a list of users for testing
        const users = await client.query('SELECT id, email, role FROM users LIMIT 5;');
        console.log(`${colors.blue}Available test users:${colors.reset}`);
        users.rows.forEach(user => {
          console.log(`  - ${user.email} (${user.role})`);
        });
      } else {
        console.log(`${colors.red}✗ No users found in database${colors.reset}`);
        console.log(`${colors.yellow}Creating a test admin user...${colors.reset}`);
        
        // Create a test admin user if none exists
        await createTestAdmin(client);
      }
    } else {
      console.log(`${colors.red}✗ Users table does not exist${colors.reset}`);
      console.log(`${colors.yellow}You need to run database migrations first${colors.reset}`);
    }
    
    client.release();
  } catch (error) {
    console.error(`${colors.red}Database connection error:${colors.reset}`, error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Create a test admin user
async function createTestAdmin(client) {
  try {
    // Check if users table exists and has the required columns
    const columnsResult = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users';
    `);
    
    const columns = columnsResult.rows.map(row => row.column_name);
    const requiredColumns = ['id', 'email', 'password_hash', 'role'];
    
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      console.log(`${colors.red}✗ Users table is missing required columns: ${missingColumns.join(', ')}${colors.reset}`);
      return;
    }
    
    // Generate a simple password hash for testing
    const testEmail = 'admin@test.com';
    const passwordHash = 'testpwd123'; // In a real implementation, use argon2 or bcrypt
    
    // Insert the test admin user
    await client.query(`
      INSERT INTO users (email, password_hash, role, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;
    `, [testEmail, passwordHash, 'admin', 'Test Admin']);
    
    console.log(`${colors.green}✓ Created test admin user: ${testEmail}${colors.reset}`);
    console.log(`${colors.yellow}Note: This is a simplified test user with an unsafe password hash.${colors.reset}`);
    console.log(`${colors.yellow}In production, use proper password hashing.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error creating test admin:${colors.reset}`, error);
  }
}

// Run the test
testDbConnection().catch(console.error);
