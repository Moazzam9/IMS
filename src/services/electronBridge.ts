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
  return electronAPI !== undefined;
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
    if (!isElectron()) {
      reject(new Error('Not running in Electron'));
      return;
    }

    const handleSaved = (result: any) => {
      electronAPI?.removeListener('pdf-saved', handleSaved);
      electronAPI?.removeListener('app-error', handleError);
      resolve(result);
    };

    const handleError = (error: any) => {
      electronAPI?.removeListener('pdf-saved', handleSaved);
      electronAPI?.removeListener('app-error', handleError);
      reject(new Error(error.message || 'Unknown error'));
    };

    electronAPI?.receive('pdf-saved', handleSaved);
    electronAPI?.receive('app-error', handleError);
    electronAPI?.send('print-to-pdf', { filename, printOptions });
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