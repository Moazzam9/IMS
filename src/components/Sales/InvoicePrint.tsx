import React, { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Sale, SaleItem, Customer, Product } from '../../types';
import Button from '../Common/Button';
import { Printer } from 'lucide-react';
import { isElectron, printToPDF } from '../../services/electronBridge';

interface InvoicePrintProps {
  sale: Sale;
  customer: Customer | undefined;
  products: Product[];
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
    logo: string | null;
  };
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({
  sale,
  customer,
  products,
  companyInfo = {
    name: 'My Inventory System',
    address: '123 Business Street, City',
    phone: '+1 234 567 890',
    email: 'contact@myinventory.com',
    website: 'www.myinventory.com',
    taxId: 'TAX-12345-ID',
    logo: null
  },
  onClose
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Get print settings from localStorage or use defaults
  const getPrintSettings = () => {
    const savedSettings = localStorage.getItem('printSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      showLogo: true,
      showTaxId: true,
      showSignature: true,
      footerText: 'Thank you for your business!',
      paperSize: 'a4'
    };
  };

  const printSettings = getPrintSettings();

  // Use useReactToPrint hook for browser printing
  const reactToPrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${sale.invoiceNumber}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  // Handle print function
  const handlePrint = useCallback(() => {
    if (isElectron()) {
      // Use Electron's PDF printing
      printToPDF(`Invoice-${sale.invoiceNumber}`, {
        landscape: false,
        printBackground: true,
        pageSize: 'A4'
      })
        .then((result) => {
          console.log('PDF saved successfully', result);
        })
        .catch((error) => {
          console.error('Failed to save PDF', error);
          // Fallback to browser printing
          if (reactToPrint) reactToPrint();
        });
    } else {
      // Use browser printing
      if (reactToPrint) reactToPrint();
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
            <Button icon={Printer} onClick={handlePrint}>Print Invoice</Button>
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
                <p className="text-gray-600">{companyInfo.phone}</p>
                <p className="text-gray-600">{companyInfo.email}</p>
                <p className="text-gray-600">{companyInfo.website}</p>
                {printSettings.showTaxId && (
                  <p className="text-gray-600">Tax ID: {companyInfo.taxId}</p>
                )}
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 mb-2">INVOICE</h2>
                <p className="text-gray-600"><span className="font-medium">Invoice #:</span> {sale.invoiceNumber}</p>
                <p className="text-gray-600"><span className="font-medium">Date:</span> {new Date(sale.saleDate).toLocaleDateString()}</p>
                <p className="text-gray-600"><span className="font-medium">Status:</span> {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Customer Information</h2>
              <p className="text-gray-700"><span className="font-medium">Name:</span> {customer?.name || 'Walk-in Customer'}</p>
              {customer?.address && (
                <p className="text-gray-700"><span className="font-medium">Address:</span> {customer.address}</p>
              )}
              {customer?.phone && (
                <p className="text-gray-700"><span className="font-medium">Phone:</span> {customer.phone}</p>
              )}
              {customer?.email && (
                <p className="text-gray-700"><span className="font-medium">Email:</span> {customer.email}</p>
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
                      <td className="py-2 px-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">${(item.discount || 0).toFixed(2)}</td>
                      <td className="py-2 px-4 text-right">${item.total.toFixed(2)}</td>
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
                  <span>${sale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Discount:</span>
                  <span>${(sale.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-b font-bold">
                  <span>Total:</span>
                  <span>${(sale.netAmount || sale.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Payment Information</h2>
              <p className="text-gray-700"><span className="font-medium">Payment Method:</span> Cash</p>
              <p className="text-gray-700"><span className="font-medium">Payment Status:</span> {sale.status === 'completed' ? 'Paid' : 'Pending'}</p>
            </div>

            {/* Signature */}
            {printSettings.showSignature && (
              <div className="mb-8 flex justify-between">
                <div className="w-1/3">
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-center text-gray-600">Customer Signature</p>
                  </div>
                </div>

                <div className="w-1/3">
                  <div className="border-t border-gray-400 pt-2">
                    <p className="text-center text-gray-600">Authorized Signature</p>
                  </div>
                </div>
              </div>
            )}

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