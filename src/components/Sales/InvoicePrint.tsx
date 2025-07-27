import React, { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Sale, SaleItem, Customer, Product } from '../../types';
import Button from '../Common/Button';
import { Printer } from 'lucide-react';
import { isElectron, printToPDF } from '../../services/electronBridge';
import { getCompanyInfo, getPrintSettings } from '../../utils/printUtils';

interface InvoicePrintProps {
  sale: Sale;
  customer: Customer | undefined;
  products: Product[];
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({
  sale,
  customer,
  products,
  onClose
}) => {
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
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
    }
  });

  // Handle print function
  const handlePrint = useCallback(() => {
    console.log('Print function called');
    
    // Always use browser printing to ensure it works
    console.log('Using browser printing');
    if (reactToPrint) {
      reactToPrint();
    } else {
      console.error('reactToPrint is not available');
      window.print(); // Fallback to window.print() if reactToPrint is not available
    }
  }, [reactToPrint, sale.invoiceNumber]);

  // Get product details for a sale item
  const getProductDetails = (item: SaleItem) => {
    return products.find(p => p.id === item.productId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Invoice #{sale.invoiceNumber}</h2>
          <div className="flex space-x-2">
            <Button 
              icon={Printer} 
              onClick={() => {
                console.log('Print Invoice button clicked in InvoicePrint');
                handlePrint();
              }}
            >
              Print Invoice
            </Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="overflow-auto p-6">
          <div ref={invoiceRef} className="p-8 bg-white">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                {printSettings.showLogo && companyInfo.logo && (
                  <img
                    src={companyInfo.logo}
                    alt="Company Logo"
                    className="h-16 mb-2"
                  />
                )}
                <h1 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h1>
                <p className="text-gray-600 whitespace-pre-line">{companyInfo.address}</p>
                <p className="text-gray-600">{companyInfo.email}</p>
                <p className="text-gray-600">{companyInfo.website}</p>
                {printSettings.showTaxId && (
                  <>
                    <p className="text-gray-600">NTN: {companyInfo.ntn}</p>
                    <p className="text-gray-600">STRN: {companyInfo.strn}</p>
                    <p className="text-gray-600">PH: {companyInfo.phone}</p>
                    <p className="text-gray-600">Cell: {companyInfo.cell}</p>
                  </>
                )}
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 mb-2">INVOICE</h2>
                <p className="text-gray-600"><span className="font-medium">Invoice #:</span> {sale.invoiceNumber}</p>
                <p className="text-gray-600"><span className="font-medium">Date:</span> {new Date(sale.saleDate).toLocaleDateString()}</p>
                <p className="text-gray-600"><span className="font-medium">Time:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                <p className="text-gray-600"><span className="font-medium">Status:</span> {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Customer Information</h2>
              <p className="text-gray-700"><span className="font-medium">Name:</span> {sale.customerName || customer?.name || 'Walk-in Customer'}</p>
              {customer?.address && (
                <p className="text-gray-700"><span className="font-medium">Address:</span> {customer.address}</p>
              )}
              {customer?.phone && (
                <p className="text-gray-700"><span className="font-medium">Phone:</span> {customer.phone}</p>
              )}
              {customer?.email && (
                <p className="text-gray-700"><span className="font-medium">Email:</span> {customer.email}</p>
              )}
              {sale.salesperson && (
                <p className="text-gray-700"><span className="font-medium">Salesperson:</span> {sale.salesperson}</p>
              )}
            </div>

            {/* Invoice Items */}
            <table className="w-full mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left border-b">Item</th>
                  <th className="py-2 px-4 text-right border-b">Qty</th>
                  <th className="py-2 px-4 text-right border-b">Unit Price</th>
                  <th className="py-2 px-4 text-right border-b">Discount</th>
                  <th className="py-2 px-4 text-right border-b">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => {
                  const product = getProductDetails(item);
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4">
                        <div className="font-medium">{product?.name || 'Unknown Product'}</div>
                        <div className="text-sm text-gray-600">{product?.code || ''}</div>
                      </td>
                      <td className="py-2 px-4 text-right">{item.quantity} {product?.unit || ''}</td>
                      <td className="py-2 px-4 text-right">₨{item.salePrice.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">₨{(item.discount || 0).toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">₨{item.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Invoice Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>₨{sale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Discount:</span>
                  <span>₨{(sale.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-b font-bold">
                  <span>Total:</span>
                  <span>₨{(sale.netAmount || sale.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Removed payment information and signatures as requested */}

            {/* Footer */}
            <div className="text-center text-gray-600 text-sm mt-8">
              <p>{printSettings.footerText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;