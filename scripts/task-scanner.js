#!/usr/bin/env node

/**
 * Task Scanner
 * 
 * This script scans the codebase to detect components, hooks, and entities,
 * then suggests updates to TASK.md based on findings.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const TASK_FILE = path.join(process.cwd(), 'TASK.md');
const PLANNING_FILE = path.join(process.cwd(), 'PLANNING.md');

// Main execution
async function main() {
  console.log('🔍 Scanning codebase for components and features...');
  
  // Read current TASK.md
  const taskContent = fs.existsSync(TASK_FILE) 
    ? fs.readFileSync(TASK_FILE, 'utf8')
    : '# TASK.md\n\n## Purpose\nTracks current tasks, backlog, and sub-tasks.\n\n## Completed (✅)\n\n## In Progress (🚧)\n\n## Backlog (🗒️)\n\n## Discovered During Development\n';
  
  // Gather stats about the codebase
  const stats = {
    pages: getDirectoryFileCount(path.join(SRC_DIR, 'pages')),
    components: getDirectoryFileCount(path.join(SRC_DIR, 'components')),
    hooks: getDirectoryFileCount(path.join(SRC_DIR, 'hooks')),
    schemas: getDirectoryFileCount(path.join(SRC_DIR, 'schemas')),
    tests: countTestFiles(SRC_DIR),
    migrations: getMigrationCount(),
  };
  
  // Detect entities by scanning schemas directory
  const entities = detectEntities();
  
  // Detect missing tests by comparing components to test files
  const missingTests = detectMissingTests();
  
  // Generate report
  console.log('\n📊 Codebase Statistics:');
  console.log(`Pages: ${stats.pages}`);
  console.log(`Components: ${stats.components}`);
  console.log(`Hooks: ${stats.hooks}`);
  console.log(`Schemas: ${stats.schemas}`);
  console.log(`Tests: ${stats.tests}`);
  console.log(`DB Migrations: ${stats.migrations}`);
  
  console.log('\n🔍 Entities Detected:');
  entities.forEach(entity => console.log(` - ${entity}`));
  
  if (missingTests.length > 0) {
    console.log('\n⚠️ Components Missing Tests:');
    missingTests.slice(0, 5).forEach(component => console.log(` - ${component}`));
    if (missingTests.length > 5) {
      console.log(` - ... and ${missingTests.length - 5} more`);
    }
  }
  
  // Suggest TASK.md updates
  const suggestions = generateTaskSuggestions(entities, missingTests, stats);
  
  console.log('\n✏️ Suggested TASK.md Updates:');
  suggestions.forEach(suggestion => console.log(` - ${suggestion}`));
  
  // Offer to update TASK.md
  console.log('\n❓ Would you like to update TASK.md with these suggestions?');
  console.log('   Run with --auto-update to automatically apply changes.');
  
  if (process.argv.includes('--auto-update')) {
    // Automatically update TASK.md
    updateTaskFile(taskContent, suggestions);
    console.log('\n✅ TASK.md has been updated!');
  }
}

// Helper functions
function getDirectoryFileCount(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  let count = 0;
  for (const file of files) {
    if (file.isDirectory()) {
      count += getDirectoryFileCount(path.join(dirPath, file.name));
    } else if (file.name.match(/\.(tsx?|jsx?)$/)) {
      count++;
    }
  }
  
  return count;
}

function countTestFiles(dirPath) {
  let count = 0;
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        scanDir(fullPath);
      } else if (file.name.match(/\.(test|spec)\.(tsx?|jsx?)$/)) {
        count++;
      }
    }
  }
  
  scanDir(dirPath);
  return count;
}

function getMigrationCount() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(migrationsDir)) return 0;
  
  return fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql')).length;
}

function detectEntities() {
  const entities = new Set();
  const schemasDir = path.join(SRC_DIR, 'schemas');
  const typesDir = path.join(SRC_DIR, 'types');
  
  if (fs.existsSync(schemasDir)) {
    fs.readdirSync(schemasDir).forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Extract entity name from file (e.g., customer.ts -> Customer)
        const entityName = file.replace(/\.schema\.(ts|tsx)$/, '').replace(/\.(ts|tsx)$/, '');
        if (entityName && !entityName.includes('.')) {
          entities.add(entityName.charAt(0).toUpperCase() + entityName.slice(1));
        }
      }
    });
  }
  
  if (fs.existsSync(typesDir)) {
    fs.readdirSync(typesDir).forEach(file => {
      if (file.endsWith('.ts') && !file.includes('.d.ts')) {
        const entityName = file.replace(/\.(ts|tsx)$/, '');
        if (entityName && !entityName.includes('.')) {
          entities.add(entityName.charAt(0).toUpperCase() + entityName.slice(1));
        }
      }
    });
  }
  
  return Array.from(entities);
}

function detectMissingTests() {
  const missingTests = [];
  const componentsDir = path.join(SRC_DIR, 'components');
  const pagesDir = path.join(SRC_DIR, 'pages');
  
  // Function to check if a component has a corresponding test
  function checkComponentForTest(componentPath, componentName) {
    // Common test file locations
    const possibleTestPaths = [
      componentPath.replace(/\.(tsx?|jsx?)$/, '.test.$1'),
      componentPath.replace(/\.(tsx?|jsx?)$/, '.spec.$1'),
      path.join(path.dirname(componentPath), '__tests__', path.basename(componentPath).replace(/\.(tsx?|jsx?)$/, '.test.$1')),
      path.join(SRC_DIR, 'test-utils', '__tests__', componentName + '.test.tsx'),
    ];
    
    if (!possibleTestPaths.some(testPath => fs.existsSync(testPath))) {
      return path.basename(componentPath);
    }
    return null;
  }
  
  // Check components
  if (fs.existsSync(componentsDir)) {
    const scanComponentsForTests = (dirPath) => {
      fs.readdirSync(dirPath, { withFileTypes: true }).forEach(entry => {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          scanComponentsForTests(entryPath);
        } else if (entry.name.match(/\.(tsx?|jsx?)$/) && !entry.name.match(/\.(test|spec)\.(tsx?|jsx?)$/)) {
          const missingTest = checkComponentForTest(entryPath, entry.name.replace(/\.(tsx?|jsx?)$/, ''));
          if (missingTest) missingTests.push(missingTest);
        }
      });
    };
    
    scanComponentsForTests(componentsDir);
  }
  
  // Check pages
  if (fs.existsSync(pagesDir)) {
    fs.readdirSync(pagesDir).forEach(file => {
      if (file.match(/\.(tsx?|jsx?)$/) && !file.match(/\.(test|spec)\.(tsx?|jsx?)$/)) {
        const pagePath = path.join(pagesDir, file);
        const missingTest = checkComponentForTest(pagePath, file.replace(/\.(tsx?|jsx?)$/, ''));
        if (missingTest) missingTests.push(missingTest);
      }
    });
  }
  
  return missingTests;
}

function generateTaskSuggestions(entities, missingTests, stats) {
  const suggestions = [];
  
  // Suggest implementing missing tests
  if (missingTests.length > 0) {
    suggestions.push(`Add tests for ${missingTests.length} components (${missingTests.slice(0, 3).join(', ')}${missingTests.length > 3 ? '...' : ''})`);
  }
  
  // Suggest API improvements if we have entities but low test coverage
  if (entities.length > 0 && stats.tests < stats.components * 0.5) {
    suggestions.push(`Implement server-side RPCs for ${entities.join(', ')} entities`);
  }
  
  // Check for pending migrations
  const gitStatus = execSync('git status --porcelain').toString();
  if (gitStatus.includes('supabase/migrations')) {
    suggestions.push('Apply and test pending migrations');
  }
  
  // Add general improvement suggestions
  suggestions.push('Refactor common CRUD patterns into reusable hooks and components');
  suggestions.push('Implement time tracking and QC functionality on WorkOrderDetail');
  
  return suggestions;
}

function updateTaskFile(content, suggestions) {
  // Find the "Discovered During Development" section
  const sections = content.split('## ');
  const discoveredSectionIndex = sections.findIndex(section => section.startsWith('Discovered During Development'));
  
  if (discoveredSectionIndex !== -1) {
    // Add suggestions to this section
    const discoveredSection = sections[discoveredSectionIndex];
    const updatedSection = discoveredSection + '\n' + suggestions.map(s => `- ${s}`).join('\n') + '\n';
    sections[discoveredSectionIndex] = updatedSection;
    
    // Write updated content
    fs.writeFileSync(TASK_FILE, sections.join('## '));
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
