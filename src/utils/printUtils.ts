/**
 * Utility functions for printing and company information
 */

// Define types for company information and print settings
interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string | null;
}

interface PrintSettings {
  showLogo: boolean;
  showTaxId: boolean;
  showSignature: boolean;
  footerText: string;
  paperSize: 'a4' | 'letter' | 'thermal';
}

/**
 * Get company information from localStorage
 * @returns CompanyInfo object with default values if not found
 */
export const getCompanyInfo = (): CompanyInfo => {
  const defaultInfo: CompanyInfo = {
    name: 'My Inventory System',
    address: '123 Business Street, City',
    phone: '+1 234 567 890',
    email: 'contact@myinventory.com',
    website: 'www.myinventory.com',
    taxId: 'TAX-12345-ID',
    logo: null
  };

  try {
    const storedInfo = localStorage.getItem('companyInfo');
    return storedInfo ? JSON.parse(storedInfo) : defaultInfo;
  } catch (error) {
    console.error('Error loading company info:', error);
    return defaultInfo;
  }
};

/**
 * Get print settings from localStorage
 * @returns PrintSettings object with default values if not found
 */
export const getPrintSettings = (): PrintSettings => {
  const defaultSettings: PrintSettings = {
    showLogo: true,
    showTaxId: true,
    showSignature: true,
    footerText: 'Thank you for your business!',
    paperSize: 'a4'
  };

  try {
    const storedSettings = localStorage.getItem('printSettings');
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  } catch (error) {
    console.error('Error loading print settings:', error);
    return defaultSettings;
  }
};

/**
 * Generate HTML for company information section in reports
 * @returns HTML string with company information
 */
export const generateCompanyInfoHTML = (): string => {
  const companyInfo = getCompanyInfo();
  const printSettings = getPrintSettings();
  
  let html = '<div style="text-align: center; margin-bottom: 20px;">';
  
  // Add logo if enabled and available
  if (printSettings.showLogo && companyInfo.logo) {
    html += `<img src="${companyInfo.logo}" alt="${companyInfo.name} Logo" style="max-height: 80px; margin-bottom: 10px;"><br>`;
  }
  
  // Add company name and details
  html += `<h2 style="margin: 5px 0;">${companyInfo.name}</h2>`;
  html += `<p style="margin: 2px 0;">${companyInfo.address}</p>`;
  html += `<p style="margin: 2px 0;">Phone: ${companyInfo.phone} | Email: ${companyInfo.email}</p>`;
  
  // Add tax ID if enabled
  if (printSettings.showTaxId) {
    html += `<p style="margin: 2px 0;">Tax ID: ${companyInfo.taxId}</p>`;
  }
  
  html += '</div>';
  
  return html;
};