/**
 * Replace Supabase Imports Script
 * 
 * This script replaces Supabase imports with local API client imports
 * across the codebase to ensure ITAR compliance.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const SUPABASE_IMPORT_PATTERN = /import\s+.*\s+from\s+['"]@\/integrations\/supabase\/client['"]/;
const LOCAL_API_IMPORT = "import { apiClient } from '@/lib/api/client';";

// Function to recursively process files in a directory
async function processDirectory(directory) {
  const entries = await readdir(directory);
  
  for (const entry of entries) {
    const entryPath = path.join(directory, entry);
    const entryStat = await stat(entryPath);
    
    if (entryStat.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry !== 'node_modules' && entry !== '.git') {
        await processDirectory(entryPath);
      }
    } else if (entryStat.isFile()) {
      // Only process TypeScript and TSX files
      if (entryPath.endsWith('.ts') || entryPath.endsWith('.tsx')) {
        await processFile(entryPath);
      }
    }
  }
}

// Function to process a single file
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if the file imports from Supabase
    if (SUPABASE_IMPORT_PATTERN.test(content)) {
      console.log(`Processing: ${filePath}`);
      
      // Replace Supabase imports with local API client import
      const updatedContent = content
        // Replace the import statement
        .replace(SUPABASE_IMPORT_PATTERN, LOCAL_API_IMPORT)
        // Replace supabase.X with apiClient.X
        .replace(/supabase\.(auth|storage|from)/g, 'apiClient.$1');
      
      // Write the updated content back to the file
      await writeFile(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Main function
async function main() {
  console.log('Starting Supabase import replacement...');
  await processDirectory(SRC_DIR);
  console.log('Supabase import replacement complete!');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
});
