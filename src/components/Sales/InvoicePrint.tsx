import React, { useRef } from 'react';
import { Sale, SaleItem, Customer, Product } from '../../types';
import Button from '../Common/Button';
import { Printer } from 'lucide-react';
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

  // Reference for direct printing

  // Component rendering

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
        </div>

        <div className="overflow-auto p-6 relative">
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
                fontSize: printSettings.paperSize === 'thermal' ? '18px' : '14px',
                lineHeight: printSettings.paperSize === 'thermal' ? '1.3' : '1.5',
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
                <h1 className="font-bold" style={{ fontSize: printSettings.paperSize === 'thermal' ? '24px' : '20px', margin: '2px 0' }}>{companyInfo.name}</h1>
                <p className="whitespace-pre-line" style={{ margin: '2px 0', fontSize: printSettings.paperSize === 'thermal' ? '15px' : '14px' }}>{companyInfo.address}</p>
                {printSettings.showTaxId && (
                  <>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '15px' : '14px' }}>NTN: {companyInfo.ntn}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '15px' : '14px' }}>STRN: {companyInfo.strn}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '15px' : '14px' }}>PH: {companyInfo.phone}</p>
                    <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '15px' : '14px' }}>Cell: {companyInfo.cell}</p>
                  </>
                )}
              </div>

              {/* Invoice Details */}
              <div className="mb-3 text-center">
                <h2 className="font-bold mb-1" style={{ fontSize: printSettings.paperSize === 'thermal' ? '21px' : '18px', margin: '2px 0' }}>INVOICE</h2>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '16px' : '14px' }}><span className="font-medium">Invoice #:</span> {sale.invoiceNumber}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '16px' : '14px' }}><span className="font-medium">Date:</span> {new Date(sale.saleDate).toLocaleDateString()}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '16px' : '14px' }}><span className="font-medium">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <p style={{ margin: '1px 0', fontSize: printSettings.paperSize === 'thermal' ? '16px' : '14px' }}><span className="font-medium">Status:</span> {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</p>
              </div>

              {/* Customer Information */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '2px 0' }}>
                <table style={{ width: '100%', fontSize: printSettings.paperSize === 'thermal' ? '16px' : '14px' }}>
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
                    {(customer?.phone || sale.customerPhone) && (
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '1px 4px 1px 0' }}>Phone:</td>
                        <td>{customer?.phone || sale.customerPhone}</td>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: printSettings.paperSize === 'thermal' ? '15px' : '14px' }}>
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
                  <div style={{ fontSize: printSettings.paperSize === 'thermal' ? '14px' : '12px', textAlign: 'right', marginTop: '2px' }}>
                    * Items with applied discounts
                  </div>
                )}
              </div>

              {/* Invoice Summary */}
              <div className="mb-3" style={{ borderTop: '1px dashed #000', paddingTop: '2px', fontSize: printSettings.paperSize === 'thermal' ? '16px' : '14px' }}>
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
              <div className="text-center" style={{ fontSize: printSettings.paperSize === 'thermal' ? '15px' : '12px', marginTop: '10px' }}>
                {printSettings.footerText && (
                  <p className="whitespace-pre-line">{printSettings.footerText}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Print Buttons - Positioned outside the invoice content as shown in the picture */}
          <div className="flex space-x-2 print:hidden print-hidden absolute" style={{ bottom: '500px', right: '20px' }}>
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
              className="text-sm"
            >
               Print
            </Button>
            <Button variant="secondary" onClick={onClose} className="text-sm">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;