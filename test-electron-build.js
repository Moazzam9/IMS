import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing Electron build setup...');

// Check if electron.js exists
if (!fs.existsSync(path.join(__dirname, 'electron.js'))) {
  console.error('Error: electron.js file not found!');
  process.exit(1);
}

// Check if preload.js exists
if (!fs.existsSync(path.join(__dirname, 'preload.js'))) {
  console.error('Error: preload.js file not found!');
  process.exit(1);
}

// Check if package.json has the required electron scripts
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonContent);

if (!packageJson.scripts['electron:dev'] || !packageJson.scripts['electron:build'] || !packageJson.scripts['electron:package']) {
  console.error('Error: Required Electron scripts not found in package.json!');
  process.exit(1);
}

// Check if electron-builder.js exists
if (!fs.existsSync(path.join(__dirname, 'electron-builder.js'))) {
  console.error('Error: electron-builder.js file not found!');
  process.exit(1);
}

// Check if the required dependencies are installed
if (!packageJson.devDependencies.electron || !packageJson.devDependencies['electron-builder']) {
  console.error('Error: Required Electron dependencies not found in package.json!');
  process.exit(1);
}

console.log('All Electron build requirements are met!');
console.log('You can now run the following commands:');
console.log('  npm run electron:dev - to run the app in development mode');
console.log('  npm run electron:build - to build the app for production');
console.log('  npm run electron:package - to create a Windows executable (.exe) file');

console.log('\nElectron setup test completed successfully!');