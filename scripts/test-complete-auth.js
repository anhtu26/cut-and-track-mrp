/**
 * Test Complete Authentication Solution
 * 
 * This script tests the entire authentication system from frontend to backend
 * to ensure all components are working correctly together.
 */

const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper to log with colors
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.magenta}=== ${msg} ===${colors.reset}\n`),
  separator: () => console.log(`${colors.cyan}----------------------------------------${colors.reset}`)
};

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3002/api';
const rootDir = path.resolve(__dirname, '..');

// Test credentials
const testCredentials = {
  email: 'admin@example.com',
  password: 'admin123'
};

/**
 * Helper function to check if the server is running
 */
async function checkServerStatus() {
  try {
    const response = await fetch(API_URL);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Test authentication API
 */
async function testAuthAPI() {
  log.title('Testing Authentication API');
  
  // Test login
  log.info('Testing login endpoint...');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCredentials)
    });
    
    if (!response.ok) {
      log.error(`Login failed with status ${response.status}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.token) {
      log.error('Login succeeded but no token was returned');
      return null;
    }
    
    log.success('Authentication API is working!');
    return data;
  } catch (error) {
    log.error(`API test failed: ${error.message}`);
    return null;
  }
}

/**
 * Verify the authentication files structure
 */
function verifyFileStructure() {
  log.title('Verifying Authentication File Structure');
  
  const requiredFiles = [
    'src/lib/auth/auth-service.ts',
    'src/lib/auth/auth-hooks.tsx',
    'src/lib/auth/README.md',
    'server/middlewares/auth-middleware.js',
    'server/controllers/auth-controller.js',
    'server/routes/auth-routes.js'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      log.success(`✓ ${filePath} exists`);
    } else {
      log.error(`✗ ${filePath} is missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

/**
 * Check if the application is free from Supabase imports
 */
function checkSupabaseImports() {
  log.title('Checking for Remaining Supabase Imports');
  
  const filesToIgnore = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    'test-results',
    'src/integrations/supabase' // This directory is expected to contain Supabase refs
  ];
  
  // Files that should be completely free of Supabase references
  const keyFilesToCheck = [
    'src/App.tsx',
    'src/main.tsx',
    'src/components/auth'
  ];
  
  let foundSupabaseImports = false;
  
  // Check key files first
  keyFilesToCheck.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        // If it's a directory, check all .ts and .tsx files inside
        checkDirectoryForSupabaseImports(fullPath);
      } else {
        // If it's a file, check the file
        if (checkFileForSupabaseImports(fullPath)) {
          foundSupabaseImports = true;
        }
      }
    }
  });
  
  return !foundSupabaseImports;
}

/**
 * Check a directory for Supabase imports
 */
function checkDirectoryForSupabaseImports(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      
      if (fs.statSync(fullPath).isDirectory()) {
        checkDirectoryForSupabaseImports(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        checkFileForSupabaseImports(fullPath);
      }
    });
  } catch (error) {
    log.error(`Error checking directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Check a file for Supabase imports
 */
function checkFileForSupabaseImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('@supabase/supabase-js') || 
        content.includes('from \'@/lib/supabase\'') ||
        content.includes('from "@/lib/supabase"')) {
      
      log.warning(`Found Supabase imports in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    log.error(`Error checking file ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Run the complete verification
 */
async function runVerification() {
  log.title('Authentication Fix Verification');
  log.info('Verifying all parts of the authentication fix plan');
  
  // Check server status
  log.info('Checking if API server is running...');
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    log.warning('API server does not appear to be running. Some tests will be skipped.');
  } else {
    log.success('API server is running!');
  }
  
  log.separator();
  
  // Verify file structure
  const filesExist = verifyFileStructure();
  
  if (!filesExist) {
    log.error('Some required authentication files are missing.');
  } else {
    log.success('All required authentication files are present.');
  }
  
  log.separator();
  
  // Check for Supabase imports
  const noSupabaseImports = checkSupabaseImports();
  
  if (!noSupabaseImports) {
    log.warning('Found some remaining Supabase imports. These should be migrated to the new authentication system.');
  } else {
    log.success('No problematic Supabase imports found in key files.');
  }
  
  log.separator();
  
  // Test authentication API if server is running
  if (serverRunning) {
    const apiResult = await testAuthAPI();
    
    if (!apiResult) {
      log.error('Authentication API test failed.');
    } else {
      log.success('Authentication API is working correctly.');
    }
  }
  
  log.separator();
  
  // Overall result
  log.title('Authentication Fix Verification Results');
  
  if (!filesExist) {
    log.error('❌ Some required files are missing. Fix these issues before proceeding.');
  } else if (!serverRunning) {
    log.warning('⚠️ Verification partially complete. Start the server to complete API testing.');
  } else if (!noSupabaseImports) {
    log.warning('⚠️ Verification mostly complete, but some Supabase imports remain.');
  } else if (serverRunning && !apiResult) {
    log.error('❌ API is not functioning correctly. Fix the authentication API issues.');
  } else {
    log.success('✅ Authentication fix appears to be correctly implemented!');
  }
  
  log.info('\nNext steps:');
  log.info('1. Complete the migration of any remaining Supabase references');
  log.info('2. Update the frontend components to use the new authentication hooks');
  log.info('3. Remove the Supabase dependency from package.json when all references are gone');
}

// Run the verification
runVerification().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
});
