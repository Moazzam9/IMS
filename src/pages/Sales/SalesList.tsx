import React, { useState } from 'react';
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
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    saleDate: new Date().toISOString().split('T')[0],
    discount: 0,
    status: 'completed' as 'completed' | 'returned'
  });
  const [saleItems, setSaleItems] = useState<Omit<SaleItem, 'id' | 'saleId'>[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);
      const netAmount = totalAmount - formData.discount;
      const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0);

      const saleData = {
        ...formData,
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
        saleDate: new Date().toISOString().split('T')[0],
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
      saleDate: sale.saleDate,
      discount: sale.discount,
      status: sale.status
    });
    setSaleItems(sale.items || []);
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
    setSaleItems([...saleItems, {
      productId: '',
      quantity: 1,
      salePrice: 0,
      discount: 0,
      total: 0
    }]);
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total for the item
    if (field === 'quantity' || field === 'salePrice' || field === 'discount') {
      const item = updatedItems[index];
      const subtotal = item.quantity * item.salePrice;
      updatedItems[index].total = subtotal - item.discount;
    }
    
    setSaleItems(updatedItems);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
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
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'discount', 
      label: 'Discount',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      key: 'netAmount', 
      label: 'Net Amount',
      render: (value: number) => `$${value.toFixed(2)}`
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
            onClick={() => setSelectedSaleForPrint(sale)}
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
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Date *
              </label>
              <input
                type="date"
                required
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span>Subtotal: ${saleItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    <span>Discount: ${formData.discount.toFixed(2)}</span>
                    <span className="font-medium">Net Amount: ${(saleItems.reduce((sum, item) => sum + item.total, 0) - formData.discount).toFixed(2)}</span>
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