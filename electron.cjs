const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, process.env.NODE_ENV === 'development' ? 'public/favicon.ico' : 'favicon.ico'),
    show: false
  });

  // Determine the correct path to load
  let startUrl;
  if (process.env.ELECTRON_START_URL) {
    // Development mode - load from dev server
    startUrl = process.env.ELECTRON_START_URL;
  } else {
    // Production mode - load from built files
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      startUrl = url.format({
        pathname: indexPath,
        protocol: 'file:',
        slashes: true
      });
    } else {
      console.error('Cannot find index.html in dist folder');
      app.quit();
      return;
    }
  }
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to avoid flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Uncomment to open DevTools on start (for development)
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Set app user model id for windows
app.setAppUserModelId(process.execPath);

// Handle creating/removing shortcuts on Windows when installing/uninstalling
let squirrelStartup = false;
try {
  squirrelStartup = require('electron-squirrel-startup');
} catch (err) {
  console.error('Error loading electron-squirrel-startup:', err.message);
}

if (squirrelStartup) {
  app.quit();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for communication between renderer and main process

// Handle app-ready event
ipcMain.on('app-ready', (event) => {
  event.reply('fromMain', { message: 'App is ready' });
});

// Handle save-data event
ipcMain.on('save-data', async (event, data) => {
  try {
    // Determine what type of data we're saving
    const { type, content } = data;
    const dataDir = path.join(app.getPath('userData'), 'data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save data to appropriate file
    const filePath = path.join(dataDir, `${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    
    event.reply('data-saved', { success: true, type, path: filePath });
  } catch (error) {
    console.error('Error saving data:', error);
    event.reply('app-error', { message: error.message });
  }
});

// Handle load-data event
ipcMain.on('load-data', async (event, data) => {
  try {
    const { type } = data;
    const filePath = path.join(app.getPath('userData'), 'data', `${type}.json`);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(fileContent);
      event.reply('data-loaded', { success: true, type, data: parsedData });
    } else {
      event.reply('data-loaded', { success: false, type, data: null, message: 'No data found' });
    }
  } catch (error) {
    console.error('Error loading data:', error);
    event.reply('app-error', { message: error.message });
  }
});

// Handle print-to-pdf event
ipcMain.on('print-to-pdf', async (event, options) => {
  console.log('Received print-to-pdf event with options:', options);
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error('No BrowserWindow found for the sender');
      event.reply('app-error', { message: 'No window found for printing' });
      return;
    }
    
    const defaultPath = path.join(app.getPath('documents'), `${options.filename || 'document'}.pdf`);
    console.log('Default save path:', defaultPath);
    
    // Ask user where to save the PDF
    console.log('Showing save dialog...');
    const saveDialogResult = await dialog.showSaveDialog({
      title: 'Save PDF',
      defaultPath,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });
    console.log('Save dialog result:', saveDialogResult);
    
    const { filePath, canceled } = saveDialogResult;
    
    if (canceled || !filePath) {
      console.log('PDF save cancelled by user');
      event.reply('app-error', { message: 'PDF save cancelled' });
      return;
    }
    
    console.log('Printing to PDF with options:', options.printOptions);
    const printOptions = {
      printBackground: true,
      landscape: false,
      ...options.printOptions
    };
    console.log('Final print options:', printOptions);
    
    const data = await win.webContents.printToPDF(printOptions);
    console.log('PDF data generated, size:', data.length);
    
    fs.writeFileSync(filePath, data);
    console.log('PDF file written to:', filePath);
    
    event.reply('pdf-saved', { success: true, path: filePath });
    console.log('pdf-saved event sent to renderer');
    
    // Ask if user wants to open the PDF
    console.log('Showing message box for opening PDF...');
    const { response } = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Open', 'Cancel'],
      defaultId: 0,
      title: 'PDF Saved',
      message: 'PDF has been saved successfully. Do you want to open it?'
    });
    console.log('Message box response:', response);
    
    if (response === 0) {
      console.log('Opening PDF file...');
      shell.openPath(filePath);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    event.reply('app-error', { message: error.message });
  }
});

// Handle toMain event (general purpose channel)
ipcMain.on('toMain', (event, data) => {
  // Process general messages from renderer
  console.log('Message from renderer:', data);
  
  // Send response back to renderer
  event.reply('fromMain', { received: true, message: 'Message received by main process' });
});

// In this file you can include the rest of your app's specific main process code
// Listen for IPC events from renderer if needed
// Example: ipcMain.on('some-event', (event, arg) => { ... });