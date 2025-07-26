// Script to build the installer
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure release directory exists
const releaseDir = path.join(__dirname, 'release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

console.log('Building React app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('React build completed successfully.');
} catch (error) {
  console.error('Error building React app:', error);
  process.exit(1);
}

console.log('Packaging Electron app...');
try {
  execSync('electron-builder --win --publish never', { stdio: 'inherit' });
  console.log('Electron packaging completed successfully.');
  console.log(`Installer created in ${releaseDir}`);
} catch (error) {
  console.error('Error packaging Electron app:', error);
  process.exit(1);
}