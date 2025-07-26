import { useEffect, useState } from 'react';

// Define the Electron API interface
interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  removeListener: (channel: string, func: (...args: any[]) => void) => void;
  getAppVersion: () => string;
}

// Get the Electron API from the window object
const electronAPI: ElectronAPI | undefined = (window as any).electron;

// Check if running in Electron
export const isElectron = (): boolean => {
  // Check if window.electron exists
  const hasElectronAPI = electronAPI !== undefined;
  
  // Additional check for Electron process
  const userAgent = navigator.userAgent.toLowerCase();
  const isElectronApp = userAgent.indexOf(' electron/') > -1;
  
  console.log('Electron API exists:', hasElectronAPI);
  console.log('Is Electron app (user agent):', isElectronApp);
  console.log('User Agent:', userAgent);
  
  return hasElectronAPI;
};

// Save data through Electron
export const saveData = (type: string, content: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isElectron()) {
      reject(new Error('Not running in Electron'));
      return;
    }

    const handleSaved = (result: any) => {
      electronAPI?.removeListener('data-saved', handleSaved);
      electronAPI?.removeListener('app-error', handleError);
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.message || 'Failed to save data'));
      }
    };

    const handleError = (error: any) => {
      electronAPI?.removeListener('data-saved', handleSaved);
      electronAPI?.removeListener('app-error', handleError);
      reject(new Error(error.message || 'Unknown error'));
    };

    electronAPI?.receive('data-saved', handleSaved);
    electronAPI?.receive('app-error', handleError);
    electronAPI?.send('save-data', { type, content });
  });
};

// Load data through Electron
export const loadData = (type: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isElectron()) {
      reject(new Error('Not running in Electron'));
      return;
    }

    const handleLoaded = (result: any) => {
      electronAPI?.removeListener('data-loaded', handleLoaded);
      electronAPI?.removeListener('app-error', handleError);
      resolve(result);
    };

    const handleError = (error: any) => {
      electronAPI?.removeListener('data-loaded', handleLoaded);
      electronAPI?.removeListener('app-error', handleError);
      reject(new Error(error.message || 'Unknown error'));
    };

    electronAPI?.receive('data-loaded', handleLoaded);
    electronAPI?.receive('app-error', handleError);
    electronAPI?.send('load-data', { type });
  });
};

// Print to PDF through Electron
export const printToPDF = (filename: string, printOptions?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('printToPDF called with filename:', filename);
    console.log('printOptions:', printOptions);
    
    if (!isElectron()) {
      console.error('Not running in Electron environment');
      reject(new Error('Not running in Electron'));
      return;
    }

    const handleSaved = (result: any) => {
      console.log('PDF saved callback received:', result);
      electronAPI?.removeListener('pdf-saved', handleSaved);
      electronAPI?.removeListener('app-error', handleError);
      resolve(result);
    };

    const handleError = (error: any) => {
      console.error('PDF error callback received:', error);
      electronAPI?.removeListener('pdf-saved', handleSaved);
      electronAPI?.removeListener('app-error', handleError);
      reject(new Error(error.message || 'Unknown error'));
    };

    console.log('Setting up event listeners for pdf-saved and app-error');
    electronAPI?.receive('pdf-saved', handleSaved);
    electronAPI?.receive('app-error', handleError);
    
    console.log('Sending print-to-pdf message to main process');
    electronAPI?.send('print-to-pdf', { filename, printOptions });
    console.log('print-to-pdf message sent');
  });
};

// Get app version
export const getAppVersion = (): string => {
  if (!isElectron()) {
    return '1.0.0';
  }
  return electronAPI?.getAppVersion() || '1.0.0';
};

// Hook to initialize Electron connection
export const useElectronInit = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isElectron()) {
      setIsReady(true);
      return;
    }

    const handleReady = () => {
      setIsReady(true);
    };

    electronAPI?.receive('fromMain', handleReady);
    electronAPI?.send('app-ready', {});

    return () => {
      electronAPI?.removeListener('fromMain', handleReady);
    };
  }, []);

  return isReady;
};