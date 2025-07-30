import React, { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
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
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Get company information and print settings from utility functions
  const companyInfo = getCompanyInfo();
  const printSettings = getPrintSettings();

  // Use useReactToPrint hook for browser printing
  const reactToPrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${oldBattery.invoiceNumber}`,
    onBeforeGetContent: () => {
      console.log('Before getting content for printing');
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('Printed successfully');
      // Close the modal after printing is complete
      onClose();
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      // Close the modal if there's an error
      onClose();
    }
  });

  // Handle print function
  const handlePrint = useCallback(() => {
    console.log('Print function called');

    try {
      // Always use browser printing to ensure it works
      console.log('Using browser printing');
      if (reactToPrint) {
        // Force a small timeout to ensure the DOM is ready
        setTimeout(() => {
          console.log('Executing reactToPrint after delay');
          reactToPrint();
        }, 100);
      } else {
        console.error('reactToPrint is not available');
        // Fallback to window.print() if reactToPrint is not available
        setTimeout(() => {
          console.log('Falling back to window.print()');
          window.print();
        }, 100);
      }
    } catch (error) {
      console.error('Error during print:', error);
      // Last resort fallback
      alert('Print function failed. Please try again.');
    }
  }, [reactToPrint]);
  
  // Automatically print when component mounts
  React.useEffect(() => {
    // Don't try to print if still loading
    if (isLoading) {
      console.log('OldBatteryPrint: Still loading, not printing yet');
      return;
    }
    
    console.log('OldBatteryPrint: Loading complete, printing after delay');
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      console.log('OldBatteryPrint: Executing print');
      // We'll use a user interaction to trigger print instead of automatic printing
      // This helps with browser security policies that may block automatic printing
      // handlePrint();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [handlePrint, isLoading]);

  // Calculate net amount
  const netAmount = (oldBattery.deductionAmount || 0) - (oldBattery.discount || 0);
  
  // Calculate remaining balance
  const remainingBalance = netAmount - (oldBattery.amountPaid || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice #{oldBattery.invoiceNumber}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="primary"
              icon={Printer}
              onClick={() => {
                console.log('Direct print button clicked');
                if (!isLoading && invoiceRef.current) {
                  directPrint(invoiceRef, `Invoice-${oldBattery.invoiceNumber}`);
                }
              }}
              disabled={isLoading}
            >
              Direct Print
            </Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
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
                fontSize: printSettings.paperSize === 'thermal' ? '10px' : '12px',
                lineHeight: printSettings.paperSize === 'thermal' ? '1.2' : '1.5'
              }}
            >
              {/* Invoice Header */}
              <div className="text-center mb-4" style={{ fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px' }}>
                {printSettings.showLogo && companyInfo.logo && (
                  <img
                    src={companyInfo.logo}
                    alt="Company Logo"
                    className="mb-2 mx-auto"
                    style={{ height: printSettings.paperSize === 'thermal' ? '40px' : '64px' }}
                  />
                )}
                <h1 className="font-bold" style={{ fontSize: printSettings.paperSize === 'thermal' ? '12px' : '18px', margin: '2px 0' }}>{companyInfo.name}</h1>
                <p className="whitespace-pre-line" style={{ margin: '2px 0', fontSize: printSettings.paperSize === 'thermal' ? '8px' : '12px' }}>{companyInfo.address}</p>
                {printSettings.showTaxId && (
                  <>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '8px' : '12px' }}>NTN: {companyInfo.ntn}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '8px' : '12px' }}>STRN: {companyInfo.strn}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '8px' : '12px' }}>PH: {companyInfo.phone}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '8px' : '12px' }}>Cell: {companyInfo.cell}</p>
                  </>
                )}
              </div>

              {/* Invoice Details */}
              <div className="mb-3 text-center" style={{ fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px' }}>
                <h2 className="font-bold mb-1" style={{ fontSize: printSettings.paperSize === 'thermal' ? '11px' : '16px', margin: '2px 0' }}>OLD BATTERY RECEIPT</h2>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Invoice #:</span> {oldBattery.invoiceNumber}</p>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Date:</span> {new Date(oldBattery.saleDate).toLocaleDateString()}</p>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>

              {/* Customer Information */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0', fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px' }}>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Customer:</span> {oldBattery.customerName || 'Walk-in Customer'}</p>
                {oldBattery.salesperson && (
                  <p style={{ margin: '1px 0' }}><span className="font-medium">Salesperson:</span> {oldBattery.salesperson}</p>
                )}
              </div>

              {/* Old Battery Details */}
              <div className="mb-4">
                <table className="w-full" style={{ fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="border-b" style={{ borderBottom: '1px dashed #000' }}>
                      <th className="py-1 text-left" style={{ padding: '2px 1px' }}>Description</th>
                      <th className="py-1 text-right" style={{ padding: '2px 1px' }}>Weight</th>
                      <th className="py-1 text-right" style={{ padding: '2px 1px' }}>Rate</th>
                      <th className="py-1 text-right" style={{ padding: '2px 1px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b" style={{ borderBottom: '1px dashed #000' }}>
                      <td className="py-1" style={{ padding: '2px 1px' }}>{oldBattery.name}</td>
                      <td className="py-1 text-right" style={{ padding: '2px 1px' }}>{oldBattery.weight}</td>
                      <td className="py-1 text-right" style={{ padding: '2px 1px' }}>₨{oldBattery.ratePerKg}</td>
                      <td className="py-1 text-right" style={{ padding: '2px 1px' }}>₨{oldBattery.deductionAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Summary */}
              <div className="mb-4" style={{ fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px' }}>
                <div className="flex justify-between py-1" style={{ padding: '2px 0' }}>
                  <span className="font-medium">Subtotal:</span>
                  <span>₨{oldBattery.deductionAmount.toFixed(2)}</span>
                </div>
                {oldBattery.discount > 0 && (
                  <div className="flex justify-between py-1" style={{ padding: '2px 0' }}>
                    <span className="font-medium">Discount:</span>
                    <span>₨{oldBattery.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 font-bold" style={{ padding: '2px 0', borderTop: '1px dashed #000' }}>
                  <span>Net Amount:</span>
                  <span>₨{netAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1" style={{ padding: '2px 0' }}>
                  <span className="font-medium">Amount Paid:</span>
                  <span>₨{(oldBattery.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 font-bold" style={{ padding: '2px 0', borderTop: '1px dashed #000', borderBottom: '1px dashed #000' }}>
                  <span>Remaining Balance:</span>
                  <span>₨{remainingBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-3" style={{ fontSize: printSettings.paperSize === 'thermal' ? '8px' : '10px' }}>
                <p style={{ margin: '1px 0' }}>{printSettings.footerText}</p>
                {companyInfo.website && <p style={{ margin: '1px 0' }}>{companyInfo.website}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OldBatteryPrint;