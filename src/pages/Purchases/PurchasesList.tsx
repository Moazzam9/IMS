import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import { Plus, Edit, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { Purchase, PurchaseItem, StockMovement } from '../../types';
import { FirebaseService } from '../../services/firebase';

const PurchasesList: React.FC = () => {
  const { purchases, suppliers, products, loading, addPurchase, updatePurchase, deletePurchase, addStockMovement } = useApp();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'completed',
    discount: 0
  });
  const [purchaseItems, setPurchaseItems] = useState<Omit<PurchaseItem, 'id' | 'purchaseId'>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('invoiceNumber');
  
  // Filter purchases based on search term and filter
  const filteredPurchases = useMemo(() => {
    if (!searchTerm) return purchases;
    
    return purchases.filter(purchase => {
      // Special case for supplier name search
      if (searchFilter === 'supplierName') {
        const supplier = suppliers.find(s => s.id === purchase.supplierId);
        return supplier && supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      // Special case for date search
      if (searchFilter === 'purchaseDate') {
        const date = new Date(purchase.purchaseDate).toLocaleDateString();
        return date.includes(searchTerm);
      }
      
      const value = purchase[searchFilter as keyof Purchase];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  }, [purchases, searchTerm, searchFilter, suppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const totalAmount = purchaseItems.reduce((sum, item) => sum + item.total, 0);
      const totalItems = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
      const netAmount = totalAmount - formData.discount;

      const purchaseData = {
        ...formData,
        totalAmount,
        netAmount,
        totalItems,
        items: purchaseItems
      };

      let purchaseId: string;
      
      if (editingPurchase) {
        purchaseId = editingPurchase.id;
        await updatePurchase(purchaseId, purchaseData);
        
        // If status changed to completed, update stock and supplier balance
        if (formData.status === 'completed' && editingPurchase.status !== 'completed') {
          await updateStockAndBalance(purchaseId, purchaseData);
        }
      } else {
        purchaseId = await addPurchase(purchaseData);
        
        // If status is completed, update stock and supplier balance
        if (formData.status === 'completed') {
          await updateStockAndBalance(purchaseId, purchaseData);
        }
      }

      setIsModalOpen(false);
      setEditingPurchase(null);
      setFormData({
        invoiceNumber: '',
        supplierId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        discount: 0
      });
      setPurchaseItems([]);
    } catch (error) {
      console.error('Error saving purchase:', error);
      showToast('Error saving purchase. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };
  
  // Function to update stock and supplier balance
  const updateStockAndBalance = async (purchaseId: string, purchaseData: any) => {
    try {
      // Update supplier balance
      const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
      if (supplier) {
        const newBalance = supplier.balance + purchaseData.netAmount;
        await updateSupplier(supplier.id, { balance: newBalance });
      }
      
      // Update product stock and create stock movements
      for (const item of purchaseData.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          // Update product stock
          const newStock = product.currentStock + item.quantity + (item.bonus || 0);
          await updateProduct(product.id, { currentStock: newStock });
          
          // Create stock movement record
          const stockMovement: Omit<StockMovement, 'id'> = {
            productId: product.id,
            type: 'purchase',
            quantity: item.quantity + (item.bonus || 0),
            referenceId: purchaseId,
            referenceType: 'purchase',
            date: purchaseData.purchaseDate,
            createdAt: new Date().toISOString()
          };
          
          await addStockMovement(stockMovement);
        }
      }
    } catch (error) {
      console.error('Error updating stock and balance:', error);
      throw error;
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      invoiceNumber: purchase.invoiceNumber,
      supplierId: purchase.supplierId,
      purchaseDate: purchase.purchaseDate,
      status: purchase.status,
      discount: purchase.discount || 0
    });
    setPurchaseItems(purchase.items || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (purchaseId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await deletePurchase(purchaseId);
      } catch (error) {
        console.error('Error deleting purchase:', error);
        showToast('Error deleting purchase. Please try again.', 'error');
      }
    }
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, {
      productId: '',
      quantity: 1,
      tradePrice: 0,
      bonus: 0,
      discount: 0,
      total: 0
    }]);
  };

  const updatePurchaseItem = (index: number, field: string, value: any) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total for the item
    if (field === 'quantity' || field === 'tradePrice' || field === 'discount') {
      const item = updatedItems[index];
      const itemDiscount = item.discount || 0;
      updatedItems[index].total = (item.quantity * item.tradePrice) - itemDiscount;
    }
    
    setPurchaseItems(updatedItems);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { 
      key: 'supplierId', 
      label: 'Supplier',
      render: (value: string) => {
        const supplier = suppliers.find(s => s.id === value);
        return supplier ? supplier.name : 'Unknown';
      }
    },
    { 
      key: 'purchaseDate', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'totalAmount', 
      label: 'Total Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'discount', 
      label: 'Discount',
      render: (value: number) => value ? `₨${value.toFixed(2)}` : '₨0.00'
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
          value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, purchase: Purchase) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(purchase)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(purchase.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600">Manage your purchase orders and inventory</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Purchase
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchBar 
            placeholder="Search purchases by invoice number, supplier, or date..."
            onSearch={(term, filter) => {
              setSearchTerm(term);
              setSearchFilter(filter);
            }}
            filterOptions={[
              { key: 'invoiceNumber', label: 'Invoice #' },
              { key: 'supplierName', label: 'Supplier' },
              { key: 'purchaseDate', label: 'Date' },
              { key: 'status', label: 'Status' }
            ]}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading purchases...</span>
          </div>
        ) : (
          <Table columns={columns} data={filteredPurchases} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPurchase(null);
          setFormData({
            invoiceNumber: '',
            supplierId: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            status: 'pending'
          });
          setPurchaseItems([]);
        }}
        title={editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
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
                Supplier *
              </label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
                min="0"
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Purchase Items</h3>
              <Button type="button" size="sm" onClick={addPurchaseItem}>
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {purchaseItems.map((item, index) => (
                <div key={index} className="grid grid-cols-7 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <select
                      value={item.productId}
                      onChange={(e) => updatePurchaseItem(index, 'productId', e.target.value)}
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
                      onChange={(e) => updatePurchaseItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Trade Price"
                      value={item.tradePrice}
                      onChange={(e) => updatePurchaseItem(index, 'tradePrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Bonus"
                      value={item.bonus || 0}
                      onChange={(e) => updatePurchaseItem(index, 'bonus', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Discount"
                      value={item.discount || 0}
                      onChange={(e) => updatePurchaseItem(index, 'discount', parseFloat(e.target.value) || 0)}
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
                      onClick={() => removePurchaseItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {purchaseItems.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Total Items: {purchaseItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">₨{purchaseItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="font-medium">₨{formData.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1">
                      <span>Net Amount:</span>
                      <span className="font-medium">₨{(purchaseItems.reduce((sum, item) => sum + item.total, 0) - formData.discount).toFixed(2)}</span>
                    </div>
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
                setEditingPurchase(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" icon={ShoppingCart} disabled={isSubmitting}>
              {isSubmitting 
                ? (editingPurchase ? 'Updating...' : 'Adding...') 
                : (editingPurchase ? 'Update Purchase' : 'Add Purchase')
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchasesList;