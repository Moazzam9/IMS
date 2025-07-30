/**
 * Utility functions for printing and company information
 */

// Define types for company information and print settings
interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  cell: string;
  email: string;
  website: string;
  ntn: string;
  strn: string;
  logo: string | null;
}

interface PrintSettings {
  showLogo: boolean;
  showTaxId: boolean; // Now controls display of NTN, STRN, Phone, and Cell
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
    name: 'Nihal Battery House & Free Oil Change',
    address: 'GT. Road Munir Abad Wah-Cantt Rawalpindi',
    phone: '051-4925171',
    cell: '03055026363',
    email: 'contact@myinventory.com',
    website: 'www.myinventory.com',
    ntn: '#F067267-1',
    strn: 'STRN-67890',
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
/**
 * Direct print function that works across different browsers
 * @param contentRef - Reference to the content to print
 * @param documentTitle - Title for the print document
 */
export const directPrint = (contentRef: React.RefObject<HTMLElement>, documentTitle: string): void => {
  if (!contentRef.current) {
    console.error('Print content reference is null');
    return;
  }

  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Could not open print window - popup blocked?');
      alert('Print failed. Please allow popups for this site.');
      return;
    }

    // Get the HTML content
    const printContent = contentRef.current.innerHTML;

    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
              }
            }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            // Auto-print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  } catch (error) {
    console.error('Error during direct print:', error);
    alert('Print failed. Please try again.');
  }
};

export const getPrintSettings = (): PrintSettings => {
  const defaultSettings: PrintSettings = {
    showLogo: true,
    showTaxId: true,
    showSignature: true,
    footerText: 'Thank you for your business!',
    paperSize: 'thermal'
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

  // Add tax information if enabled
  if (printSettings.showTaxId) {
    html += `<p style="margin: 2px 0;">NTN: ${companyInfo.ntn} | STRN: ${companyInfo.strn}</p>`;
    html += `<p style="margin: 2px 0;">Phone: ${companyInfo.phone} | Cell: ${companyInfo.cell}</p>`;
  }

  html += '</div>';

  return html;
};