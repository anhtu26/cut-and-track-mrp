/**
 * Test Password Hash Verification
 * 
 * This script tests the password hash verification directly using argon2
 * to understand why the authentication is failing.
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

// Password hash from the database
const PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=1$NXc5UHFmVDRZY0JodGRGSA$KCQXCwlxMhXEH5QcIZ0RGGaR9mY0xKsqwoGJVSl9/Hs';

// Test password
const TEST_PASSWORD = 'admin123';

// Test password verification
async function testPasswordVerification() {
  log.title('Password Hash Verification Test');
  
  try {
    log.info(`Testing password: "${TEST_PASSWORD}"`);
    log.info(`Against hash: ${PASSWORD_HASH}`);
    
    // Verify password with argon2
    const isValid = await argon2.verify(PASSWORD_HASH, TEST_PASSWORD);
    
    if (isValid) {
      log.success('Password verification successful!');
    } else {
      log.error('Password verification failed!');
    }
    
    // Generate a new hash for the password
    log.info('Generating a new hash for the same password...');
    const newHash = await argon2.hash(TEST_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 2**16,
      timeCost: 3,
      parallelism: 1
    });
    
    log.info(`New hash: ${newHash}`);
    
    // Verify the new hash
    const isNewHashValid = await argon2.verify(newHash, TEST_PASSWORD);
    
    if (isNewHashValid) {
      log.success('New hash verification successful!');
    } else {
      log.error('New hash verification failed!');
    }
    
    // Provide SQL to update the password hash
    log.title('SQL to Update Password Hash');
    console.log(`
UPDATE users
SET password_hash = '${newHash}'
WHERE email = 'admin@example.com';
    `);
    
  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error.stack);
  }
}

// Run the test
testPasswordVerification();
