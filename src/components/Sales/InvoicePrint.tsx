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
        // Print immediately without additional delay
        console.log('Executing reactToPrint immediately');
        reactToPrint();
      } else {
        console.error('reactToPrint is not available');
        // Fallback to window.print() if reactToPrint is not available
        console.log('Falling back to window.print()');
        window.print();
        // Close the modal after print dialog is shown
        onClose();
      }
    } catch (error) {
      console.error('Error during print:', error);
      // Last resort fallback
      alert('Print function failed. Please try again.');
      // Make sure we close the modal even if there's an error
      onClose();
    }
  }, [reactToPrint, sale.invoiceNumber, onClose]);

  // Component is ready for user to click print
  React.useEffect(() => {
    // Don't try to print if still loading
    if (isLoading) {
      console.log('InvoicePrint: Still loading, not ready yet');
      return;
    }
    
    console.log('InvoicePrint: Loading complete, ready for user to click print');
    // No automatic printing - user will click the print button
    
    return () => {
      console.log('InvoicePrint: Component unmounting');
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
                <h2 className="font-bold mb-1" style={{ fontSize: printSettings.paperSize === 'thermal' ? '11px' : '16px', margin: '2px 0' }}>INVOICE</h2>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Invoice #:</span> {sale.invoiceNumber}</p>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Date:</span> {new Date(sale.saleDate).toLocaleDateString()}</p>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Status:</span> {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</p>
              </div>

              {/* Customer Information */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0', fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px' }}>
                <p style={{ margin: '1px 0' }}><span className="font-medium">Customer:</span> {sale.customerName || customer?.name || 'Walk-in Customer'}</p>
                {customer?.address && (
                  <p style={{ margin: '1px 0' }}><span className="font-medium">Address:</span> {customer.address}</p>
                )}
                {customer?.phone && (
                  <p style={{ margin: '1px 0' }}><span className="font-medium">Phone:</span> {customer.phone}</p>
                )}
                {sale.salesperson && (
                  <p style={{ margin: '1px 0' }}><span className="font-medium">Salesperson:</span> {sale.salesperson}</p>
                )}
              </div>

              {/* Invoice Items */}
              <div className="mb-3" style={{ fontSize: printSettings.paperSize === 'thermal' ? '8px' : '12px' }}>
                <div style={{ borderBottom: '1px dashed #000', marginBottom: '2px', paddingBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ width: '40%', fontWeight: 'bold' }}>Item</span>
                  <span style={{ width: '15%', textAlign: 'center', fontWeight: 'bold' }}>Qty</span>
                  <span style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>Price</span>
                  <span style={{ width: '25%', textAlign: 'right', fontWeight: 'bold' }}>Total</span>
                </div>
                {sale.items.map((item, index) => {
                  const product = getProductDetails(item);
                  return (
                    <div key={index} style={{ marginBottom: '2px', paddingBottom: '2px', borderBottom: index === sale.items.length - 1 ? 'none' : '1px dotted #ccc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ width: '40%' }}>{product?.name || 'Unknown Product'}</span>
                        <span style={{ width: '15%', textAlign: 'center' }}>{item.quantity} {product?.unit || ''}</span>
                        <span style={{ width: '20%', textAlign: 'right' }}>₨{item.salePrice.toFixed(2)}</span>
                        <span style={{ width: '25%', textAlign: 'right' }}>₨{item.total.toFixed(2)}</span>
                      </div>
                      {(item.discount > 0) && (
                        <div style={{ fontSize: printSettings.paperSize === 'thermal' ? '7px' : '10px', textAlign: 'right' }}>
                          Discount: ₨{(item.discount || 0).toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Invoice Summary */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', paddingTop: '2px', fontSize: printSettings.paperSize === 'thermal' ? '9px' : '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
                  <span className="font-medium">Subtotal:</span>
                  <span>₨{sale.totalAmount.toFixed(2)}</span>
                </div>
                {sale.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
                    <span className="font-medium">Discount:</span>
                    <span>₨{sale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0', fontWeight: 'bold', borderTop: '1px dotted #000', borderBottom: '1px dotted #000', padding: '2px 0' }}>
                  <span>Total:</span>
                  <span>₨{(sale.netAmount || sale.totalAmount).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
                  <span className="font-medium">Amount Paid:</span>
                  <span>₨{(sale.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
                  <span className="font-medium">Remaining Balance:</span>
                  <span style={{ color: (sale.remainingBalance || 0) > 0 ? '#dc2626' : 'inherit', fontWeight: (sale.remainingBalance || 0) > 0 ? 'bold' : 'normal' }}>₨{(sale.remainingBalance || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Removed payment information and signatures as requested */}

              {/* Footer */}
              <div className="text-center" style={{ fontSize: printSettings.paperSize === 'thermal' ? '8px' : '10px', marginTop: '10px' }}>
                {printSettings.footerText && (
                  <p className="whitespace-pre-line">{printSettings.footerText}</p>
                )}
                <p style={{ marginTop: '5px' }}>Thank you for your business!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;