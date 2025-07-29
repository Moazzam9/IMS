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
import { useAuth } from '../../contexts/AuthContext';

type PurchaseItemDraft = Omit<PurchaseItem, 'id' | 'purchaseId'> & {
  newProductCode?: string;
  newProductName?: string;
  newProductCategory?: string;
  newProductUnit?: string;
  newProductSalePrice?: number;
  newProductIsBattery?: boolean;
  newProductPacking?: string;
  newProductRetailer?: string;
};

const PurchasesList: React.FC = () => {
  const { purchases, suppliers, products, setProducts, loading, addProduct, addPurchase, updatePurchase, deletePurchase, addStockMovement, updateSupplier, updateProduct } = useApp();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'completed'
  });
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemDraft[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('invoiceNumber');
  const { user } = useAuth();
  const userId = user?.firebaseUid || '';

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
      // First, process any new products that need to be created
      const processedItems = [...purchaseItems];

      for (let i = 0; i < processedItems.length; i++) {
        const item = processedItems[i];

        // If this is a new product that needs to be created
        if (item.productId === 'new_product' && item.newProductCode && item.newProductName) {
          // Create the new product
          const newProductData = {
            code: item.newProductCode,
            name: item.newProductName,
            category: item.newProductCategory || '',
            unit: item.newProductUnit || 'pcs',
            tradePrice: item.tradePrice || 0,
            salePrice: item.newProductSalePrice || 0,
            currentStock: 0, // Will be updated after purchase is completed
            minStockLevel: 10,
            isBattery: item.newProductIsBattery || false,
            packing: item.newProductIsBattery ? item.newProductPacking || '' : '',
            retailer: item.newProductIsBattery ? item.newProductRetailer || '' : '',
            createdAt: new Date().toISOString(),
          };

          // Add the product to the database and get the new product ID
          const newProductId = await addProduct(newProductData);

          // Optionally, add the new product to the products list in state if needed
          // Update the purchase item with the new product ID
          processedItems[i] = {
            ...item,
            productId: newProductId,
            // Remove the temporary new product fields
            newProductCode: undefined,
            newProductName: undefined,
            newProductCategory: undefined,
            newProductUnit: undefined,
            newProductSalePrice: undefined,
            newProductIsBattery: undefined,
            newProductPacking: undefined,
            newProductRetailer: undefined
          };
          setProducts(prev => [...prev, { ...newProductData, id: newProductId }]);
        } else if (item.productId && item.productId !== 'new_product') {
          // Ensure tradePrice and name are up to date for existing products
          const product = products.find(p => p.id === item.productId);
          if (product) {
            processedItems[i].tradePrice = product.tradePrice;
          }
        }
        // Always recalculate total
        processedItems[i].total = processedItems[i].quantity * processedItems[i].tradePrice;
      }

      // Remove any items without a valid productId
      let validItems = processedItems.filter(item => item.productId && item.productId !== '');

      // Strip all newProduct* fields before saving
      validItems = validItems.map(({ newProductCode, newProductName, newProductCategory, newProductUnit, newProductSalePrice, newProductIsBattery, newProductPacking, newProductRetailer, ...rest }) => rest) as PurchaseItem[];

      // Debug: Log the productId and check if it exists in products list
      validItems.forEach(item => {
        const found = products.find(p => p.id === item.productId);
        console.log('Purchase item:', item, 'Product found in products list:', !!found);
      });

      // Validate all required fields for each item
      const missingFields = validItems.some(item =>
        !item.productId ||
        typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0 ||
        typeof item.tradePrice !== 'number' || isNaN(item.tradePrice) ||
        typeof item.total !== 'number' || isNaN(item.total)
      );
      if (missingFields) {
        showToast('Each purchase item must have a valid product, quantity, and rate.', 'error');
        setIsSubmitting(false);
        return;
      }

      // Prevent saving if there are no valid items
      if (validItems.length === 0) {
        showToast('Please add at least one valid product to the purchase.', 'error');
        setIsSubmitting(false);
        return;
      }

      const totalAmount = validItems.reduce((sum, item) => sum + item.total, 0);
      const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
      const netAmount = totalAmount;

      const purchaseData = {
        ...formData,
        totalAmount,
        netAmount,
        totalItems,
        discount: 0,
        items: validItems as PurchaseItem[],
        createdAt: new Date().toISOString(),
      };

      // Log for debugging
      console.log('Saving purchaseData:', purchaseData);

      let purchaseId: string;

      if (editingPurchase) {
        purchaseId = editingPurchase.id;
        await updatePurchase(purchaseId, purchaseData);

        // Always update stock and supplier balance, but function will check status
        await updateStockAndBalance(purchaseId, purchaseData);
      } else {
        purchaseId = await addPurchase(purchaseData);

        // Always update stock and supplier balance, but function will check status
        await updateStockAndBalance(purchaseId, purchaseData);
      }

      setIsModalOpen(false);
      setEditingPurchase(null);
      setFormData({
        invoiceNumber: '',
        supplierId: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        status: 'pending'
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

      // Only update stock if purchase status is completed
      if (purchaseData.status === 'completed') {
        // Fetch latest products from Firebase
        const latestProducts = await FirebaseService.getProducts(userId);
        // Update product stock and create stock movements
        for (const item of purchaseData.items) {
          const product = latestProducts.find((p: any) => p.id === item.productId);
          if (product) {
            // Update product stock
            const newStock = product.currentStock + item.quantity;
            await updateProduct(product.id, { currentStock: newStock });

            // Create stock movement record
            const stockMovement: Omit<StockMovement, 'id'> = {
              productId: product.id,
              type: 'purchase',
              quantity: item.quantity,
              referenceId: purchaseId,
              referenceType: 'purchase',
              date: purchaseData.purchaseDate,
              createdAt: new Date().toISOString()
            };

            await addStockMovement(stockMovement);
          }
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
      status: purchase.status
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
    // Set a default trade price that's not zero
    const defaultTradePrice = 1;
    setPurchaseItems([...purchaseItems, {
      productId: '',
      quantity: 1,
      tradePrice: defaultTradePrice,
      total: defaultTradePrice, // Set initial total to match the trade price
      salePrice: 0, // Add this line
      // Default values for new product fields
      newProductCode: '',
      newProductName: '',
      newProductCategory: '',
      newProductUnit: 'pcs',
      newProductSalePrice: 0,
      newProductIsBattery: false,
      newProductPacking: '',
      newProductRetailer: ''
    }]);
  };

  const updatePurchaseItem = (index: number, field: string, value: any) => {
    const updatedItems = [...purchaseItems];
    // Always parse quantity and tradePrice as numbers
    if (field === 'quantity') {
      value = parseInt(value, 10) || 0;
    }
    if (field === 'tradePrice') {
      value = parseFloat(value) || 0;
    }
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If product is selected, automatically set the trade price
    if (field === 'productId' && value && value !== 'new_product') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].tradePrice = selectedProduct.tradePrice;
      }
    }

    // Calculate total for the item - always calculate regardless of product type
    if (field === 'quantity' || field === 'tradePrice' || field === 'productId') {
      const item = updatedItems[index];
      updatedItems[index].total = (item.quantity || 0) * (item.tradePrice || 0);
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
      key: 'productName',
      label: 'Product Name',
      render: (_: any, purchase: Purchase) => {
        if (purchase.items && purchase.items.length > 0) {
          const productId = purchase.items[0].productId;
          const product = products.find(p => p.id === productId);
          return product ? product.name : 'Unknown';
        }
        return 'No products';
      }
    },
    {
      key: 'tradePrice',
      label: 'Trade Price per piece',
      render: (_: any, purchase: Purchase) => {
        if (purchase.items && purchase.items.length > 0) {
          const productId = purchase.items[0].productId;
          const product = products.find(p => p.id === productId);
          return `₨${(product ? product.tradePrice : 0).toFixed(2)}`;
        }
        return '₨0.00';
      }
    },
    { key: 'totalItems', label: 'Items' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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

          <div className="grid grid-cols-2 gap-4">
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

            {/* Column Headers */}
            <div className="grid grid-cols-5 gap-3 p-2 bg-gray-200 rounded-lg font-medium text-sm mb-2">
              <div>Product</div>
              <div>Quantity</div>
              <div>Rate</div>
              <div>Total</div>
              <div>Action</div>
            </div>

            <div className="space-y-3">
              {purchaseItems.map((item, index) => (
                <div key={`purchase-item-${index}-${item.productId || 'new'}`} className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    {item.productId === 'new_product' ? (
                      <div className="space-y-2 p-2 border border-blue-200 rounded-md bg-blue-50">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-blue-700">New Product Details</h4>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                            onClick={() => updatePurchaseItem(index, 'productId', '')}
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Product Code*</label>
                            <input
                              type="text"
                              placeholder="Product Code*"
                              value={item.newProductCode || ''}
                              onChange={(e) => updatePurchaseItem(index, 'newProductCode', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Product Name*</label>
                            <input
                              type="text"
                              placeholder="Product Name*"
                              value={item.newProductName || ''}
                              onChange={(e) => updatePurchaseItem(index, 'newProductName', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Quantity*</label>
                            <input
                              type="number"
                              placeholder="Quantity*"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10) || 0;
                                updatePurchaseItem(index, 'quantity', value);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-0.5">Trade Price*</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Trade Price*"
                              value={item.tradePrice}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updatePurchaseItem(index, 'tradePrice', value);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Category"
                            value={item.newProductCategory || ''}
                            onChange={(e) => updatePurchaseItem(index, 'newProductCategory', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <select
                            value={item.newProductUnit || 'pcs'}
                            onChange={(e) => updatePurchaseItem(index, 'newProductUnit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="pcs">Pieces</option>
                            <option value="kg">Kilograms</option>
                            <option value="ltr">Liters</option>
                            <option value="box">Boxes</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Sale Price*"
                            value={item.newProductSalePrice || ''}
                            onChange={(e) => updatePurchaseItem(index, 'newProductSalePrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            required
                          />
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.newProductIsBattery || false}
                              onChange={(e) => updatePurchaseItem(index, 'newProductIsBattery', e.target.checked)}
                              className="mr-1"
                            />
                            <label className="text-xs">Battery product</label>
                          </div>
                        </div>
                        {item.newProductIsBattery && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Packing (e.g. 12V 150AH)"
                              value={item.newProductPacking || ''}
                              onChange={(e) => updatePurchaseItem(index, 'newProductPacking', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Retailer (e.g. Exide)"
                              value={item.newProductRetailer || ''}
                              onChange={(e) => updatePurchaseItem(index, 'newProductRetailer', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <select
                        value={item.productId}
                        onChange={(e) => updatePurchaseItem(index, 'productId', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      >
                        <option value="">Select Product</option>
                        <option value="new_product" className="font-medium text-blue-600">+ Add New Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    )}
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
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        updatePurchaseItem(index, 'tradePrice', value);
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      required
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
                    <div className="flex justify-between border-t border-blue-200 pt-1">
                      <span>Net Amount:</span>
                      <span className="font-medium">₨{purchaseItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
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