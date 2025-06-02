// @ts-check
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting Tailwind CSS build process for v4.1.5...');

// Ensure both ESM and CommonJS config files exist for compatibility
function ensureConfigFiles() {
  const tailwindConfigJs = './tailwind.config.js';
  const tailwindConfigCjs = './tailwind.config.cjs';
  const configContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
  const configContentCjs = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

  // Create ESM config if it doesn't exist
  if (!fs.existsSync(tailwindConfigJs)) {
    console.log('Creating ESM tailwind.config.js...');
    fs.writeFileSync(tailwindConfigJs, configContent);
  }

  // Create CommonJS config if it doesn't exist
  if (!fs.existsSync(tailwindConfigCjs)) {
    console.log('Creating CommonJS tailwind.config.cjs...');
    fs.writeFileSync(tailwindConfigCjs, configContentCjs);
  }

  // Ensure PostCSS configs exist in both formats
  const postcssConfigJs = './postcss.config.js';
  const postcssConfigCjs = './postcss.config.cjs';
  const postcssContent = `/** @type {import('postcss').Config} */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};
`;
  const postcssContentCjs = `/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
};
`;

  // Create PostCSS configs
  if (!fs.existsSync(postcssConfigJs)) {
    console.log('Creating ESM postcss.config.js...');
    fs.writeFileSync(postcssConfigJs, postcssContent);
  }
  
  if (!fs.existsSync(postcssConfigCjs)) {
    console.log('Creating CommonJS postcss.config.cjs...');
    fs.writeFileSync(postcssConfigCjs, postcssContentCjs);
  }
}

// Ensure the public directory exists
function ensurePublicDir() {
  const publicDir = './public';
  if (!fs.existsSync(publicDir)) {
    console.log('Creating public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
  }
}

/**
 * Builds Tailwind CSS from input file to output file
 * @returns {Promise<void>} Promise that resolves when build completes
 */
function buildTailwindCSS() {
  console.log('Building Tailwind CSS with CLI...');
  const inputFile = './src/index.css';
  const outputFile = './public/tailwind.css';
  
  // Ensure the input file exists with minimal Tailwind directives if it doesn't
  if (!fs.existsSync(inputFile)) {
    console.log(`Input file ${inputFile} not found, creating minimal version...`);
    const dir = path.dirname(inputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(inputFile, `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`);
  }

  // Using void promise to indicate no return value is expected
  return new Promise((/** @type {() => void} */ resolve, reject) => {
    // Use both formats to ensure compatibility in Docker
    const tailwindCommand = `npx tailwindcss -i ${inputFile} -o ${outputFile} --minify`;
    
    exec(tailwindCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error building Tailwind CSS: ${error.message}`);
        
        // Create a minimal fallback if the main build fails
        console.log('Creating minimal fallback CSS as a backup...');
        try {
          console.log('Creating fallback CSS by copying essential styles');
          fs.copyFileSync('./public/essential-styles.css', outputFile);
          console.log(`Copied essential styles to ${outputFile} as fallback`);
          // Continue even though we're using fallback
          resolve();
        } catch (fallbackError) {
          console.error(`Failed to create fallback CSS: ${fallbackError.message}`);
          reject(error);
        }
        return;
      }
      
      if (stderr) {
        console.warn(`Warning during Tailwind build: ${stderr}`);
      }
      
      console.log(`Tailwind CSS build output: ${stdout}`);
      console.log(`Tailwind CSS successfully built to ${outputFile}`);
      // Build completed successfully
      resolve();
    });
  });
}

// Main execution
try {
  // Ensure all config files exist
  ensureConfigFiles();
  
  // Ensure public directory exists
  ensurePublicDir();
  
  // Build Tailwind CSS
  buildTailwindCSS().then(() => {
    console.log('Tailwind CSS build process completed successfully.');
  }).catch(error => {
    console.error('Failed to build Tailwind CSS:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Error in Tailwind CSS build process:', error);
  process.exit(1);
}
