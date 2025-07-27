import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import InvoicePrint from '../../components/Sales/InvoicePrint';
import { Plus, Edit, Trash2, TrendingUp, Printer } from 'lucide-react';
import { Sale, SaleItem } from '../../types';
import { FirebaseService } from '../../services/firebase';

const SalesList: React.FC = () => {
  const { sales, customers, products, loading, addSale, updateSale, deleteSale } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  
  // Monitor selectedSaleForPrint changes
  useEffect(() => {
    if (selectedSaleForPrint) {
      console.log('selectedSaleForPrint updated:', selectedSaleForPrint);
    }
  }, [selectedSaleForPrint]);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    salesperson: '',
    saleDate: new Date().toISOString().slice(0, 16), // Include date and time (YYYY-MM-DDTHH:MM)
    discount: 0,
    status: 'completed' as 'completed' | 'returned'
  });
  
  // Generate sequential invoice number when modal opens
  useEffect(() => {
    if (isModalOpen && !editingSale) {
      // Find the highest invoice number and increment by 1
      const highestInvoiceNumber = sales.reduce((highest, sale) => {
        const currentNumber = parseInt(sale.invoiceNumber);
        return isNaN(currentNumber) ? highest : Math.max(highest, currentNumber);
      }, 0);
      
      setFormData(prev => ({
        ...prev,
        invoiceNumber: (highestInvoiceNumber + 1).toString()
      }));
    }
  }, [isModalOpen, editingSale, sales]);
  const [saleItems, setSaleItems] = useState<Omit<SaleItem, 'id' | 'saleId'>[]>([]);

  // Calculate total discount from individual item discounts
  const calculateTotalDiscount = (items: Omit<SaleItem, 'id' | 'saleId'>[]) => {
    return items.reduce((sum, item) => sum + (item.discount || 0), 0);
  };
  
  // Update item totals when they change
  useEffect(() => {
    if (saleItems.length > 0) {
      // Recalculate totals for all items
      const updatedItems = saleItems.map(item => {
        const subtotal = item.quantity * item.salePrice;
        return {
          ...item,
          total: subtotal - (item.discount || 0)
        };
      });
      setSaleItems(updatedItems);
    }
  }, [saleItems.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate totals using individual item discounts
      const totalDiscount = saleItems.reduce((sum, item) => sum + (item.discount || 0), 0);
      const totalAmount = saleItems.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
      const netAmount = totalAmount - totalDiscount;
      const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0);

      const saleData = {
        ...formData,
        discount: totalDiscount, // Ensure the discount field has the sum of all item discounts
        totalAmount,
        netAmount,
        totalItems,
        items: saleItems
      };

      if (editingSale) {
        await updateSale(editingSale.id, saleData);
      } else {
        await addSale(saleData);
      }

      setIsModalOpen(false);
      setEditingSale(null);
      setFormData({
        invoiceNumber: '',
        customerId: '',
        customerName: '',
        salesperson: '',
        saleDate: new Date().toISOString().slice(0, 16), // Include date and time (YYYY-MM-DDTHH:MM)
        discount: 0,
        status: 'completed'
      });
      setSaleItems([]);
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error saving sale. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      invoiceNumber: sale.invoiceNumber,
      customerId: sale.customerId || '',
      customerName: sale.customerName || '',
      salesperson: sale.salesperson || '',
      saleDate: sale.saleDate,
      discount: sale.discount,
      status: sale.status
    });
    
    // Ensure each item has a discount value
    const itemsWithDiscounts = (sale.items || []).map(item => ({
      ...item,
      discount: item.discount || 0,
      total: (item.quantity * item.salePrice) - (item.discount || 0)
    }));
    
    setSaleItems(itemsWithDiscounts);
    setIsModalOpen(true);
  };

  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(saleId);
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error deleting sale. Please try again.');
      }
    }
  };

  const addSaleItem = () => {
    const newItem = {
      productId: '',
      quantity: 1,
      salePrice: 0,
      discount: 0,
      total: 0
    };
    
    setSaleItems([...saleItems, newItem]);
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total for the item
    if (field === 'quantity' || field === 'salePrice' || field === 'discount') {
      const item = updatedItems[index];
      // Calculate total after discount
      const subtotal = item.quantity * item.salePrice;
      updatedItems[index].total = subtotal - (item.discount || 0);
      
      // Update the overall discount to be the sum of individual discounts
      const totalDiscount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
      setFormData(prev => ({ ...prev, discount: totalDiscount }));
    }
    
    setSaleItems(updatedItems);
  };

  const removeSaleItem = (index: number) => {
    const updatedItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(updatedItems);
    
    // Update the overall discount to be the sum of individual discounts
    const totalDiscount = updatedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    setFormData(prev => ({ ...prev, discount: totalDiscount }));
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { 
      key: 'customerId', 
      label: 'Customer',
      render: (value: string) => {
        if (!value) return 'Walk-in Customer';
        const customer = customers.find(c => c.id === value);
        return customer ? customer.name : 'Unknown';
      }
    },
    { 
      key: 'saleDate', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'totalAmount', 
      label: 'Total',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'discount', 
      label: 'Discount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'netAmount', 
      label: 'Net Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { key: 'totalItems', label: 'Items' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, sale: Sale) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(sale)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(sale.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => {
              console.log('Print button clicked for sale:', sale);
              setSelectedSaleForPrint(sale);
            }}
            className="text-green-600 hover:text-green-800"
            title="Print Invoice"
          >
            <Printer size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600">Manage your sales and customer transactions</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Sale
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading sales...</span>
          </div>
        ) : (
          <Table columns={columns} data={sales} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSale(null);
          setFormData({
            invoiceNumber: '',
            customerId: '',
            customerName: '',
            salesperson: '',
            saleDate: new Date().toISOString().split('T')[0],
            discount: 0,
            status: 'completed'
          });
          setSaleItems([]);
        }}
        title={editingSale ? 'Edit Sale' : 'Add New Sale'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name (Manual)
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name manually"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salesperson
              </label>
              <input
                type="text"
                value={formData.salesperson}
                onChange={(e) => setFormData({ ...formData, salesperson: e.target.value })}
                placeholder="Enter salesperson name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Discount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'completed' | 'returned' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="completed">Completed</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sale Items</h3>
              <Button type="button" size="sm" onClick={addSaleItem}>
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {/* Column Headers */}
              <div className="grid grid-cols-6 gap-3 p-2 bg-gray-200 rounded-lg font-medium text-sm">
                <div>Item Name</div>
                <div>Quantity</div>
                <div>Rate</div>
                <div>Discount</div>
                <div>Total</div>
                <div></div>
              </div>
              
              {saleItems.map((item, index) => (
                <div key={index} className="grid grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <select
                      value={item.productId}
                      onChange={(e) => updateSaleItem(index, 'productId', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Sale Price"
                      value={item.salePrice}
                      onChange={(e) => updateSaleItem(index, 'salePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Discount"
                      value={item.discount}
                      onChange={(e) => updateSaleItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Total"
                      value={item.total.toFixed(2)}
                      readOnly
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeSaleItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {saleItems.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total Items: {saleItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  <div className="space-x-4">
                    <span>Subtotal: ₨{saleItems.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0).toFixed(2)}</span>
                    <span>Discount: ₨{saleItems.reduce((sum, item) => sum + (item.discount || 0), 0).toFixed(2)}</span>
                    <span className="font-medium">Net Amount: ₨{saleItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSale(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" icon={TrendingUp} disabled={isSubmitting}>
              {isSubmitting 
                ? (editingSale ? 'Updating...' : 'Adding...') 
                : (editingSale ? 'Update Sale' : 'Add Sale')
              }
            </Button>
          </div>
        </form>
      </Modal>

      {selectedSaleForPrint && (
        <InvoicePrint
          sale={selectedSaleForPrint}
          customer={customers.find(c => c.id === selectedSaleForPrint.customerId)}
          products={products}
          onClose={() => setSelectedSaleForPrint(null)}
        />
      )}
    </div>
  );
};

export default SalesList;