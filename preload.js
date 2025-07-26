// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain', 'app-ready', 'save-data', 'load-data', 'print-to-pdf'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive messages from main process
    receive: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Remove event listener
    removeListener: (channel, func) => {
      const validChannels = ['fromMain', 'data-saved', 'data-loaded', 'pdf-saved', 'app-error'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
    // Get app version
    getAppVersion: () => process.env.npm_package_version || '1.0.0'
  }
);

// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Send messages to main process
    send: (channel, data) => {
      // Whitelist channels for security
      const validChannels = ['toMain