/**
 * Generate Admin Password Hash
 * 
 * This script generates a properly hashed password for the admin user
 * using Argon2 and outputs a SQL command to update the admin user.
 */

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
const ADMIN_PASSWORD = 'admin123';

// Main function
async function main() {
  log.title('Generate Admin Password Hash');
  
  try {
    // Hash the password with argon2
    log.info(`Hashing password '${ADMIN_PASSWORD}' with argon2...`);
    const passwordHash = await argon2.hash(ADMIN_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 2**16,
      timeCost: 3,
      parallelism: 1
    });
    
    log.success('Password hash generated successfully!');
    log.info(`Password hash: ${passwordHash}`);
    
    // Generate SQL command to update admin user
    const sqlCommand = `
-- Run this in PostgreSQL to update or create the admin user
DO $$
DECLARE
    admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@example.com') INTO admin_exists;
    
    IF admin_exists THEN
        -- Update existing admin user
        UPDATE users 
        SET role = 'Administrator',
            password_hash = '${passwordHash}',
            first_name = 'Admin',
            last_name = 'User'
        WHERE email = 'admin@example.com';
        
        RAISE NOTICE 'Admin user updated successfully';
    ELSE
        -- Create new admin user
        INSERT INTO users (id, email, password_hash, role, first_name, last_name)
        VALUES (
            uuid_generate_v4(),
            'admin@example.com',
            '${passwordHash}',
            'Administrator',
            'Admin',
            'User'
        );
        
        RAISE NOTICE 'Admin user created successfully';
    END IF;
END $$;
    `;
    
    log.title('SQL Command to Update Admin User');
    console.log(sqlCommand);
    
    log.info('\nCopy this SQL command and run it in the PostgreSQL database');
    log.info('You can use: docker-compose exec postgres psql -U postgres -d mrp_db');
    log.info('Then paste the SQL command to update the admin user');
    
  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  log.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
