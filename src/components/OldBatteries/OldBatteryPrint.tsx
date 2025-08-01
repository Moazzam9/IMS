import React, { useRef } from 'react';
import { OldBattery } from '../../types';
import Button from '../Common/Button';
import { Printer } from 'lucide-react';
import { getCompanyInfo, getPrintSettings, directPrint } from '../../utils/printUtils';

interface OldBatteryPrintProps {
  oldBattery: OldBattery;
  onClose: () => void;
  isLoading?: boolean;
}

const OldBatteryPrint: React.FC<OldBatteryPrintProps> = ({
  oldBattery,
  onClose,
  isLoading = false
}) => {
  console.log('OldBatteryPrint component mounted with invoice:', oldBattery.invoiceNumber);
  
  // Log when component unmounts
  React.useEffect(() => {
    return () => {
      console.log('OldBatteryPrint component unmounted');
    };
  }, []);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Get company information and print settings from utility functions
  const companyInfo = getCompanyInfo();
  const printSettings = getPrintSettings();

  // Reference for direct printing
  
  // Component rendering
  // Calculate net amount
  const netAmount = (oldBattery.deductionAmount || 0) - (oldBattery.discount || 0);
  
  // Calculate remaining balance
  const remainingBalance = netAmount - (oldBattery.amountPaid || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice #{oldBattery.invoiceNumber}</h2>
        </div>

        <div className="overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading old battery receipt data...</span>
            </div>
          ) : (
            <div 
              ref={invoiceRef} 
              className="p-8 bg-white"
              style={{
                width: printSettings.paperSize === 'thermal' ? '80mm' : 'auto',
                maxWidth: printSettings.paperSize === 'thermal' ? '80mm' : 'auto',
                margin: '0 auto',
                fontSize: printSettings.paperSize === 'thermal' ? '12px' : '14px',
                lineHeight: printSettings.paperSize === 'thermal' ? '1.2' : '1.5',
                textAlign: 'center'
              }}
            >
              {/* Invoice Header */}
              <div className="text-center mb-4">
                {printSettings.showLogo && companyInfo.logo && (
                  <img
                    src={companyInfo.logo}
                    alt="Company Logo"
                    className="mb-2 mx-auto"
                    style={{ height: printSettings.paperSize === 'thermal' ? '40px' : '64px' }}
                  />
                )}
                <h1 className="font-bold" style={{ fontSize: printSettings.paperSize === 'thermal' ? '16px' : '20px', margin: '2px 0' }}>{companyInfo.name}</h1>
                <p className="whitespace-pre-line" style={{ margin: '2px 0', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>{companyInfo.address}</p>
                {printSettings.showTaxId && (
                  <>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>NTN: {companyInfo.ntn}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>STRN: {companyInfo.strn}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>PH: {companyInfo.phone}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>Cell: {companyInfo.cell}</p>
                  </>
                )}
              </div>

              {/* Invoice Details */}
              <div className="mb-3 text-center">
                <h2 className="font-bold mb-1" style={{ fontSize: printSettings.paperSize === 'thermal' ? '14px' : '18px', margin: '2px 0' }}>OLD BATTERY RECEIPT</h2>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Invoice #:</span> {oldBattery.invoiceNumber}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Date:</span> {new Date(oldBattery.saleDate).toLocaleDateString()}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>

              {/* Customer Information */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0' }}>
                <table style={{ width: '100%', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Customer:</td>
                      <td>{oldBattery.customerName || 'Walk-in Customer'}</td>
                    </tr>
                    {oldBattery.salesperson && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Salesperson:</td>
                        <td>{oldBattery.salesperson}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Old Battery Details */}
              <div className="mb-4">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px dashed #000' }}>
                      <th style={{ textAlign: 'left', padding: '2px 1px', fontWeight: 'bold' }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold' }}>Weight</th>
                      <th style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold' }}>Rate</th>
                      <th style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px dashed #000' }}>
                      <td style={{ textAlign: 'left', padding: '2px 1px' }}>{oldBattery.name}</td>
                      <td style={{ textAlign: 'center', padding: '2px 1px' }}>{oldBattery.weight}</td>
                      <td style={{ textAlign: 'center', padding: '2px 1px' }}>₨{oldBattery.ratePerKg}</td>
                      <td style={{ textAlign: 'center', padding: '2px 1px' }}>₨{oldBattery.deductionAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Summary */}
              <div className="mb-4" style={{ fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Subtotal:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>₨{oldBattery.deductionAmount.toFixed(2)}</td>
                    </tr>
                    {oldBattery.discount > 0 && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Discount:</td>
                        <td style={{ padding: '2px 0', textAlign: 'right' }}>₨{oldBattery.discount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '1px dotted #000' }}>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Net Amount:</td>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'right' }}>₨{netAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Amount Paid:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>₨{(oldBattery.amountPaid || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000' }}>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Remaining Balance:</td>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'right' }}>₨{remainingBalance.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="text-center mt-3" style={{ fontSize: printSettings.paperSize === 'thermal' ? '10px' : '12px' }}>
                {printSettings.footerText && (
                  <p className="whitespace-pre-line">{printSettings.footerText}</p>
                )}
              </div>
              
              {/* Print Buttons */}
              <div className="flex justify-center space-x-2 mt-4 print:hidden">
                <Button 
                  variant="success" 
                  icon={Printer}
                  onClick={() => directPrint(invoiceRef, `Invoice-${oldBattery.invoiceNumber}`)}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Direct Print
                </Button>
                <Button variant="secondary" onClick={onClose} className="text-sm">Close</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OldBatteryPrint;