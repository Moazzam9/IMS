import React, { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Sale, SaleItem, Customer, Product } from '../../types';
import Button from '../Common/Button';
import { Printer } from 'lucide-react';
import { isElectron, printToPDF } from '../../services/electronBridge';
import { getCompanyInfo, getPrintSettings, directPrint } from '../../utils/printUtils';

interface InvoicePrintProps {
  sale: Sale;
  customer: Customer | undefined;
  products: Product[];
  onClose: () => void;
  isLoading?: boolean;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({
  sale,
  customer,
  products,
  onClose,
  isLoading = false
}) => {
  console.log('InvoicePrint received sale data:', sale);
  console.log('Sale items:', sale.items);
  console.log('Sale items with old battery data:', sale.items.filter(item => item.oldBatteryData));
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Get company information and print settings from utility functions
  const companyInfo = getCompanyInfo();
  const printSettings = getPrintSettings();

  // Use useReactToPrint hook for browser printing
  const reactToPrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${sale.invoiceNumber}`,
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
        // Force a longer timeout to ensure the DOM is ready
        setTimeout(() => {
          console.log('Executing reactToPrint after delay');
          reactToPrint();
        }, 500); // Increased from 100ms to 500ms for reliability
      } else {
        console.error('reactToPrint is not available');
        // Fallback to window.print() if reactToPrint is not available
        setTimeout(() => {
          console.log('Falling back to window.print()');
          window.print();
          // Ensure we close the modal even if print dialog is canceled
          setTimeout(() => {
            onClose();
          }, 1000);
        }, 500);
      }
    } catch (error) {
      console.error('Error during print:', error);
      // Last resort fallback
      alert('Print function failed. Please try again.');
      // Make sure we close the modal even if there's an error
      onClose();
    }
  }, [reactToPrint, sale.invoiceNumber, onClose]);

  // Automatically print when component mounts
  React.useEffect(() => {
    // Don't try to print if still loading
    if (isLoading) {
      console.log('InvoicePrint: Still loading, not printing yet');
      return;
    }
    
    console.log('InvoicePrint: Loading complete, printing after delay');
    // Small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      console.log('InvoicePrint: Ready for user to click print');
      // We'll use a user interaction to trigger print instead of automatic printing
      // This helps with browser security policies that may block automatic printing
    }, 500);
    
    return () => {
      console.log('InvoicePrint: Cleaning up timers');
      clearTimeout(timer);
    };
  }, [isLoading]);

  // Get product details for a sale item
  const getProductDetails = (item: SaleItem) => {
    const product = products.find(p => p.id === item.productId);
    if (product && item.oldBatteryData) {
      const quantity = item.oldBatteryData.quantity || 1;
      const deductionAmount = item.oldBatteryData.weight * item.oldBatteryData.ratePerKg * quantity;
      return {
        ...product,
        name: `${product.name} (Old Battery: ${item.oldBatteryData.name}, Qty: ${quantity}, Weight: ${item.oldBatteryData.weight}kg @ Rs.${item.oldBatteryData.ratePerKg}/kg = Rs.${deductionAmount} deduction)`,
        oldBatteryDeduction: deductionAmount
      };
    }
    return product;
  };

  // Calculate total old battery deductions
  const totalOldBatteryDeductions = sale.items
    .filter(item => item.oldBatteryData)
    .reduce((total, item) => {
      const quantity = item.oldBatteryData?.quantity || 1;
      const deductionAmount = item.oldBatteryData ?
        item.oldBatteryData.weight * item.oldBatteryData.ratePerKg * quantity : 0;
      return total + deductionAmount;
    }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col" style={{ 
        width: printSettings.paperSize === 'thermal' ? '80mm' : '100%',
        maxWidth: printSettings.paperSize === 'thermal' ? '80mm' : '4xl'
      }}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice #{sale.invoiceNumber}</h2>
          <div className="flex space-x-2">
            <Button 
              variant="primary"
              icon={Printer}
              onClick={handlePrint}
              disabled={isLoading}
            >
              Print Invoice
            </Button>
            <Button 
              variant="success"
              icon={Printer}
              onClick={() => {
                console.log('Direct print button clicked');
                if (!isLoading && invoiceRef.current) {
                  directPrint(invoiceRef, `Invoice-${sale.invoiceNumber}`);
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
              <span className="ml-2 text-gray-600">Preparing invoice for printing...</span>
            </div>
          ) : (
            <div 
              ref={invoiceRef} 
              className="p-8 bg-white"
              style={{
                width: printSettings.paperSize === 'thermal' ? '80mm' : 'auto',
                maxWidth: printSettings.paperSize === 'thermal' ? '80mm' : '4xl',
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
                <h2 className="font-bold mb-1" style={{ fontSize: printSettings.paperSize === 'thermal' ? '14px' : '18px', margin: '2px 0' }}>INVOICE</h2>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Invoice #:</span> {sale.invoiceNumber}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Date:</span> {new Date(sale.saleDate).toLocaleDateString()}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}><span className="font-medium">Status:</span> {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</p>
              </div>

              {/* Customer Information */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0' }}>
                <table style={{ width: '100%', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Customer:</td>
                      <td>{sale.customerName || customer?.name || 'Walk-in Customer'}</td>
                    </tr>
                    {customer?.address && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Address:</td>
                        <td>{customer.address}</td>
                      </tr>
                    )}
                    {customer?.phone && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Phone:</td>
                        <td>{customer.phone}</td>
                      </tr>
                    )}
                    {sale.salesperson && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Salesperson:</td>
                        <td>{sale.salesperson}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Items */}
              <div className="mb-3">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: printSettings.paperSize === 'thermal' ? '10px' : '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px dashed #000' }}>
                      <th style={{ textAlign: 'left', padding: '2px 1px', fontWeight: 'bold', width: '40%' }}>Item</th>
                      <th style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold', width: '15%' }}>Qty</th>
                      <th style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold', width: '20%' }}>Price</th>
                      <th style={{ textAlign: 'center', padding: '2px 1px', fontWeight: 'bold', width: '25%' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item, index) => {
                      const product = getProductDetails(item);
                      return (
                        <tr key={index} style={{ borderBottom: index === sale.items.length - 1 ? 'none' : '1px dotted #ccc' }}>
                          <td style={{ textAlign: 'left', padding: '2px 1px' }}>{product?.name || 'Unknown Product'}</td>
                          <td style={{ textAlign: 'center', padding: '2px 1px' }}>{item.quantity} {product?.unit || ''}</td>
                          <td style={{ textAlign: 'center', padding: '2px 1px' }}>₨{item.salePrice.toFixed(2)}</td>
                          <td style={{ textAlign: 'center', padding: '2px 1px' }}>₨{item.total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Discounts shown separately if needed */}
                {sale.items.some(item => item.discount > 0) && (
                  <div style={{ fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px', textAlign: 'right', marginTop: '2px' }}>
                    * Items with applied discounts
                  </div>
                )}
              </div>

              {/* Invoice Summary */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', paddingTop: '2px', fontSize: printSettings.paperSize === 'thermal' ? '11px' : '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Subtotal:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>₨{sale.totalAmount.toFixed(2)}</td>
                    </tr>
                    {sale.discount > 0 && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Discount:</td>
                        <td style={{ padding: '2px 0', textAlign: 'right' }}>₨{sale.discount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr style={{ borderTop: '1px dotted #000', borderBottom: '1px dotted #000' }}>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Total:</td>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'right' }}>₨{(sale.netAmount || sale.totalAmount).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Amount Paid:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right' }}>₨{(sale.amountPaid || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '2px 0', textAlign: 'left' }}>Remaining Balance:</td>
                      <td style={{ padding: '2px 0', textAlign: 'right', color: (sale.remainingBalance || 0) > 0 ? '#dc2626' : 'inherit', fontWeight: (sale.remainingBalance || 0) > 0 ? 'bold' : 'normal' }}>₨{(sale.remainingBalance || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Removed payment information and signatures as requested */}

              {/* Footer */}
              <div className="text-center" style={{ fontSize: printSettings.paperSize === 'thermal' ? '10px' : '12px', marginTop: '10px' }}>
                {printSettings.footerText && (
                  <p className="whitespace-pre-line">{printSettings.footerText}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;