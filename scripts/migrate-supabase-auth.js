/**
 * Supabase Auth Migration Utility
 * 
 * This script helps migrate from Supabase authentication to the local authentication system.
 * It scans the codebase for Supabase authentication references and provides guidance on replacing them.
 * 
 * Part of the ITAR compliance migration to remove all cloud dependencies.
 */

const fs = require('fs');
const path = require('path');

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

// Path to root directory
const rootDir = path.resolve(__dirname, '..');

// Directories to ignore
const ignoreDirectories = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.windsurf',
  '.vscode'
];

// Patterns to search for
const authPatterns = [
  '@supabase/supabase-js',
  'supabase.auth.signInWithPassword',
  'supabase.auth.signOut',
  'supabase.auth.getSession',
  'supabase.auth.getUser',
  'supabase.auth.onAuthStateChange'
];

// Replacement patterns
const replacementGuide = {
  '@supabase/supabase-js': 'Remove Supabase dependency and import from \'@/lib/auth-implementation\' instead',
  'supabase.auth.signInWithPassword': 'Replace with auth.signInWithPassword from \'@/lib/auth-implementation\'',
  'supabase.auth.signOut': 'Replace with auth.signOut from \'@/lib/auth-implementation\'',
  'supabase.auth.getSession': 'Replace with auth.getSession from \'@/lib/auth-implementation\'',
  'supabase.auth.getUser': 'Replace with auth.getUser from \'@/lib/auth-implementation\'',
  'supabase.auth.onAuthStateChange': 'Replace with React hook useAuth() from \'@/lib/auth/auth-hooks\''
};

// Files to keep as backward compatibility layers (but mark as deprecated)
const compatibilityLayers = [
  'src/lib/supabase-client-proxy.ts',
  'src/integrations/supabase/client.ts'
];

// Results tracking
const results = {
  scannedFiles: 0,
  matchingFiles: 0,
  matches: []
};

/**
 * Check if a file should be scanned
 */
function shouldScanFile(filePath) {
  // Only scan TypeScript/JavaScript files
  if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) {
    return false;
  }
  
  // Skip files in ignore directories
  for (const ignore of ignoreDirectories) {
    if (filePath.includes(`/${ignore}/`) || filePath.includes(`\\${ignore}\\`)) {
      return false;
    }
  }
  
  // Skip compatibility layer files
  for (const layer of compatibilityLayers) {
    if (filePath.endsWith(layer)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Scan a file for Supabase authentication patterns
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    results.scannedFiles++;
    
    const fileMatches = [];
    
    // Check for each pattern
    authPatterns.forEach(pattern => {
      if (content.includes(pattern)) {
        fileMatches.push(pattern);
      }
    });
    
    if (fileMatches.length > 0) {
      results.matchingFiles++;
      results.matches.push({
        file: filePath,
        matches: fileMatches
      });
    }
  } catch (error) {
    log.error(`Error scanning file ${filePath}: ${error.message}`);
  }
}

/**
 * Scan a directory recursively
 */
function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Skip ignored directories
        if (!ignoreDirectories.includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (stats.isFile() && shouldScanFile(itemPath)) {
        scanFile(itemPath);
      }
    }
  } catch (error) {
    log.error(`Error scanning directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Generate a migration report
 */
function generateReport() {
  log.title('Supabase Authentication Migration Report');
  
  log.info(`Total files scanned: ${results.scannedFiles}`);
  log.info(`Files with Supabase auth references: ${results.matchingFiles}`);
  
  if (results.matchingFiles === 0) {
    log.success('No Supabase authentication references found! Migration complete.');
    return;
  }
  
  log.separator();
  log.title('Files to Migrate');
  
  results.matches.forEach(({ file, matches }) => {
    const relativePath = path.relative(rootDir, file);
    log.info(`File: ${relativePath}`);
    
    matches.forEach(match => {
      log.warning(`  - Pattern: ${match}`);
      log.info(`    Replace with: ${replacementGuide[match] || 'Use direct local authentication'}`);
    });
    
    log.separator();
  });
  
  log.title('Migration Guide');
  log.info('1. Replace Supabase imports with local authentication implementation.');
  log.info('2. For components, use the React hooks provided in @/lib/auth/auth-hooks.tsx');
  log.info('3. For services and utilities, use the functions from @/lib/auth-implementation.ts');
  log.info('4. Remove @supabase/supabase-js dependency when all references are migrated.');
  
  log.separator();
  log.title('React Hook Examples');
  log.info(`
// Replace this Supabase code:
import { supabase } from '@/lib/supabase';
const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
};

// With this local authentication code:
import { useAuth } from '@/lib/auth/auth-hooks';
const { login, error } = useAuth();
const handleLogin = async () => {
  await login(email, password);
};
  `);
  
  log.separator();
  log.info('Run npm run auth:test to verify the authentication system is working correctly.');
}

// Run the scan
log.title('Scanning for Supabase Auth References');
scanDirectory(rootDir);
generateReport();
