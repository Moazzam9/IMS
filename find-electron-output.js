import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the package.json to get the build configuration
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonContent);

console.log('Checking electron-builder output directory configuration...');

// Get the output directory from the package.json
const outputDir = packageJson.build?.directories?.output || 'dist_electron';
console.log(`Configured output directory: ${outputDir}`);

// Check if the output directory exists
const outputDirPath = path.join(__dirname, outputDir);
const outputDirExists = fs.existsSync(outputDirPath);
console.log(`Output directory exists: ${outputDirExists}`);

// If the output directory doesn't exist, try to find it in common locations
if (!outputDirExists) {
  console.log('Searching for electron-builder output in common locations...');
  
  const commonLocations = [
    'dist_electron',
    'release',
    'out',
    'build',
    'dist/electron',
    'dist/win',
    'dist/win-unpacked',
    '..',  // Parent directory
  ];
  
  for (const location of commonLocations) {
    const locationPath = path.join(__dirname, location);
    const exists = fs.existsSync(locationPath);
    console.log(`- ${location}: ${exists ? 'EXISTS' : 'not found'}`);
    
    if (exists) {
      try {
        const items = fs.readdirSync(locationPath);
        console.log(`  Contents: ${items.join(', ')}`);
        
        // Check for .exe files
        const exeFiles = items.filter(item => item.endsWith('.exe'));
        if (exeFiles.length > 0) {
          console.log(`  Found .exe files: ${exeFiles.join(', ')}`);
        }
      } catch (error) {
        console.log(`  Error reading directory: ${error.message}`);
      }
    }
  }
}

// Check if there are any .exe files in the current directory
console.log('\nChecking for .exe files in the current directory...');
try {
  const items = fs.readdirSync(__dirname);
  const exeFiles = items.filter(item => item.endsWith('.exe'));
  if (exeFiles.length > 0) {
    console.log(`Found .exe files: ${exeFiles.join(', ')}`);
  } else {
    console.log('No .exe files found in the current directory.');
  }
} catch (error) {
  console.log(`Error reading directory: ${error.message}`);
}

console.log('\nSearch completed.');