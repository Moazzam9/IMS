import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import InvoicePrint from '../../components/Sales/InvoicePrint';
import OldBatteryForm from '../../components/Sales/OldBatteryForm';
import { Plus, Edit, Trash2, TrendingUp, Printer, Battery } from 'lucide-react';
import { Sale, SaleItem, OldBattery } from '../../types';
import { database } from '../../config/firebase';
import { ref, push, set, remove } from 'firebase/database';
import { FirebaseService } from '../../services/firebase';
import { OldBatteryService } from '../../services/oldBatteryService';

const SalesList: React.FC = () => {
  const { sales, customers, products, loading, addSale, updateSale, deleteSale, getSaleItems } = useApp();
  const { user } = useAuth();
  const userId = user?.firebaseUid;
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const isClosingRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('invoiceNumber');

  // Filter sales based on search term and filter
  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;

    return sales.filter(sale => {
      // Special case for customer name search
      if (searchFilter === 'customerName') {
        const customer = customers.find(c => c.id === sale.customerId);
        return customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      }

      // Special case for date search
      if (searchFilter === 'saleDate') {
        const date = new Date(sale.saleDate).toLocaleDateString();
        return date.includes(searchTerm);
      }

      const value = sale[searchFilter as keyof Sale];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  }, [sales, searchTerm, searchFilter, customers]);

  // Monitor selectedSaleForPrint changes
  useEffect(() => {
    console.log('selectedSaleForPrint state changed:', selectedSaleForPrint ? `Sale ID: ${selectedSaleForPrint.id}` : 'null');
  }, [selectedSaleForPrint]);

  // Monitor filtered sales changes
  useEffect(() => {
    console.log('Filtered sales updated:', filteredSales.length, 'sales');
  }, [filteredSales]);

  // Cleanup effect to reset invoice state when component unmounts or user changes
  useEffect(() => {
    return () => {
      setSelectedSaleForPrint(null);
      setIsLoadingInvoice(false);
    };
  }, []);

  // Removed the problematic useEffect that was causing the invoice to reappear
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    salesperson: '',
    saleDate: new Date().toISOString().slice(0, 16), // Include date and time (YYYY-MM-DDTHH:MM)
    discount: 0,
    amountPaid: 0,
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
  const [saleItems, setSaleItems] = useState<(Omit<SaleItem, 'id' | 'saleId'> & { oldBatteryData?: Omit<OldBattery, 'id' | 'saleId' | 'saleItemId' | 'createdAt'> })[]>([]);

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
    if (!userId) {
      showToast('User authentication error', 'error');
      return;
    }

    if (saleItems.length === 0) {
      showToast('Please add at least one item to the sale', 'error');
      return;
    }

    // Validate sale items data
    const invalidSaleItem = saleItems.find(item =>
      !item.productId ||
      !item.quantity ||
      !item.salePrice ||
      typeof item.total !== 'number'
    );

    if (invalidSaleItem) {
      showToast('Please fill in all sale item details correctly', 'error');
      return;
    }

    // Validate old battery data
    const invalidOldBatteryItem = saleItems.find(item =>
      item.oldBatteryData && (
        !item.oldBatteryData.name ||
        !item.oldBatteryData.weight ||
        !item.oldBatteryData.ratePerKg ||
        typeof item.oldBatteryData.deductionAmount !== 'number'
      )
    );

    if (invalidOldBatteryItem) {
      showToast('Please fill in all old battery details correctly', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      // Calculate totals
      const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0);
      const totalDiscount = saleItems.reduce((sum, item) => {
        const itemDiscount = item.discount || 0;
        const oldBatteryDeduction = item.oldBatteryData?.deductionAmount || 0;
        return sum + itemDiscount + oldBatteryDeduction;
      }, 0);
      const netAmount = totalAmount - totalDiscount;
      const amountPaid = parseFloat(formData.amountPaid.toString()) || 0;
      const remainingBalance = netAmount - amountPaid;
      const totalItems = saleItems.reduce((sum, item) => sum + item.quantity, 0);

      // Validate sale items before creating sale data
      if (!saleItems || saleItems.length === 0) {
        throw new Error('Sale must include at least one item');
      }

      // Validate required fields for each sale item
      saleItems.forEach((item, index) => {
        if (!item.productId || !item.quantity || !item.salePrice || typeof item.total !== 'number') {
          throw new Error(`Invalid data for sale item ${index + 1}`);
        }
        if (item.oldBatteryData) {
          if (!item.oldBatteryData.name || !item.oldBatteryData.weight ||
            !item.oldBatteryData.ratePerKg || typeof item.oldBatteryData.deductionAmount !== 'number') {
            throw new Error(`Invalid old battery data for item ${index + 1}`);
          }
        }
      });

      const saleData = {
        ...formData,
        discount: totalDiscount,
        totalAmount,
        netAmount,
        amountPaid,
        remainingBalance,
        totalItems,
        createdAt: new Date().toISOString(),
        items: saleItems.map(item => {
          // Ensure all required fields are present and valid
          if (!item.productId || !item.quantity || !item.salePrice || typeof item.total !== 'number') {
            throw new Error('Invalid sale item data');
          }

          const saleItem = {
            productId: item.productId,
            quantity: item.quantity,
            salePrice: item.salePrice,
            discount: item.discount || 0,
            total: item.total,
            includeOldBattery: !!item.oldBatteryData
          };

          // Only include oldBatteryData if it exists and has all required fields
          if (item.oldBatteryData) {
            if (!item.oldBatteryData.name || !item.oldBatteryData.weight ||
              !item.oldBatteryData.ratePerKg || typeof item.oldBatteryData.deductionAmount !== 'number') {
              throw new Error('Invalid old battery data');
            }
            saleItem.oldBatteryData = {
              name: item.oldBatteryData.name,
              weight: item.oldBatteryData.weight,
              ratePerKg: item.oldBatteryData.ratePerKg,
              deductionAmount: item.oldBatteryData.deductionAmount
            };
          }

          return saleItem;
        })
      };

      let saleId;

      if (editingSale) {
        // Update existing sale
        await updateSale(editingSale.id, saleData);
        saleId = editingSale.id;

        // Delete existing items to replace with new ones
        const saleItemsRef = ref(database, `users/${userId}/saleItems/${saleId}`);
        await remove(saleItemsRef);

        // Delete existing old batteries associated with this sale
        const existingOldBatteries = await OldBatteryService.getOldBatteriesBySaleId(saleId, userId);
        for (const oldBattery of existingOldBatteries) {
          await OldBatteryService.deleteOldBattery(oldBattery.id, userId);
        }

        // Save new sale items and old batteries for editing
        try {
          // Add sale items and old batteries
          const saleItemsRef = ref(database, `users/${userId}/saleItems/${saleId}`);

          // First, save all sale items and collect their IDs
          const savedItems = await Promise.all(saleItems.map(async (item) => {
            const newItemRef = push(saleItemsRef);
            const saleItemId = newItemRef.key!;

            if (!item.productId || !item.quantity || !item.salePrice || typeof item.total !== 'number') {
              throw new Error('Invalid sale item data');
            }

            const itemData = {
              id: saleItemId,
              saleId,
              productId: item.productId,
              quantity: item.quantity,
              salePrice: item.salePrice,
              discount: item.discount || 0,
              total: item.total,
              includeOldBattery: !!item.oldBatteryData,
              createdAt: new Date().toISOString()
            };

            // Add sale item
            await set(newItemRef, itemData);
            return { saleItemId, item };
          }));

          // Then, save all old battery data
          const oldBatteryPromises = savedItems
            .filter(({ item }) => item.oldBatteryData)
            .map(async ({ saleItemId, item }) => {
              if (!item.oldBatteryData?.name || !item.oldBatteryData?.weight ||
                !item.oldBatteryData?.ratePerKg || typeof item.oldBatteryData?.deductionAmount !== 'number') {
                throw new Error('Invalid old battery data');
              }

              const oldBatteryData = {
                name: item.oldBatteryData.name,
                weight: item.oldBatteryData.weight,
                ratePerKg: item.oldBatteryData.ratePerKg,
                deductionAmount: item.oldBatteryData.deductionAmount,
                saleId,
                saleItemId
              };
              await OldBatteryService.addOldBattery(oldBatteryData, userId);
            });

          await Promise.all(oldBatteryPromises);
        } catch (error) {
          console.error('Error saving sale items:', error);
          throw new Error('Failed to save sale items and old battery data');
        }
      } else {
        // Add new sale - FirebaseService.addSale already handles saving items and old batteries
        console.log('Saving sale data:', saleData);
        saleId = await addSale(saleData);
        console.log('Sale saved with ID:', saleId);
      }

      setIsModalOpen(false);
      setEditingSale(null);
      setSelectedSaleForPrint(null); // Clear selected sale for print
      setFormData({
        invoiceNumber: '',
        customerId: '',
        customerName: '',
        salesperson: '',
        saleDate: new Date().toISOString().slice(0, 16),
        discount: 0,
        amountPaid: 0,
        status: 'completed'
      });
      setSaleItems([]);

      // Show success message
      showToast(
        editingSale
          ? 'Sale updated successfully!'
          : 'Sale added successfully!',
        'success'
      );
    } catch (error) {
      console.error('Error saving sale:', error);
      showToast('Error saving sale. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };

  const handleEdit = async (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      invoiceNumber: sale.invoiceNumber,
      customerId: sale.customerId || '',
      customerName: sale.customerName || '',
      salesperson: sale.salesperson || '',
      saleDate: sale.saleDate,
      discount: sale.discount,
      amountPaid: sale.amountPaid || 0,
      status: sale.status
    });

    try {
      // Load sale items for this sale
      const saleItems = await getSaleItems(sale.id);
      console.log('Loaded sale items for editing:', saleItems);

      // Ensure each item has a discount value
      const itemsWithDiscounts = saleItems.map(item => ({
        ...item,
        discount: item.discount || 0,
        total: (item.quantity * item.salePrice) - (item.discount || 0)
      }));

      setSaleItems(itemsWithDiscounts);
    } catch (error) {
      console.error('Error loading sale items for editing:', error);
      setSaleItems([]);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(saleId);
        showToast('Sale deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting sale:', error);
        showToast('Error deleting sale. Please try again.', 'error');
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

  const handleOldBatteryChange = useCallback((index: number, oldBatteryData: {
    name: string;
    weight: number;
    ratePerKg: number;
    deductionAmount: number;
  } | null) => {
    const updatedItems = [...saleItems];

    if (oldBatteryData) {
      updatedItems[index].oldBatteryData = oldBatteryData;

      // Recalculate total with old battery deduction
      const subtotal = updatedItems[index].quantity * updatedItems[index].salePrice;
      updatedItems[index].total = subtotal - (updatedItems[index].discount || 0) - oldBatteryData.deductionAmount;
    } else {
      // Remove old battery data and recalculate total without deduction
      delete updatedItems[index].oldBatteryData;

      const subtotal = updatedItems[index].quantity * updatedItems[index].salePrice;
      updatedItems[index].total = subtotal - (updatedItems[index].discount || 0);
    }

    setSaleItems(updatedItems);
  }, [saleItems]);

  const updateSaleItem = (index: number, field: string, value: any) => {
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If product is selected, automatically set the sale price
    if (field === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].salePrice = selectedProduct.salePrice;

        // Recalculate total after setting the sale price
        const subtotal = updatedItems[index].quantity * selectedProduct.salePrice;
        const oldBatteryDeduction = updatedItems[index].oldBatteryData?.deductionAmount || 0;
        updatedItems[index].total = subtotal - (updatedItems[index].discount || 0) - oldBatteryDeduction;
      }
    }

    // Calculate total for the item
    if (field === 'quantity' || field === 'salePrice' || field === 'discount') {
      const item = updatedItems[index];
      // Calculate total after discount and old battery deduction
      const subtotal = item.quantity * item.salePrice;
      const oldBatteryDeduction = item.oldBatteryData?.deductionAmount || 0;
      updatedItems[index].total = subtotal - (item.discount || 0) - oldBatteryDeduction;

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
    {
      key: 'amountPaid',
      label: 'Amount Paid',
      render: (value: number) => `₨${(value || 0).toFixed(2)}`
    },
    {
      key: 'remainingBalance',
      label: 'Remaining Balance',
      render: (value: number) => `₨${(value || 0).toFixed(2)}`
    },
    { key: 'totalItems', label: 'Items' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
            onClick={async () => {
              if (isClosingRef.current) {
                console.log('Preventing print while closing');
                return;
              }

              console.log('Print button clicked for sale:', sale);
              setIsLoadingInvoice(true);

              // Get the latest sale data with items and old battery data
              try {
                const saleItems = await getSaleItems(sale.id);
                console.log('Loaded sale items for printing:', saleItems);

                const saleWithItems = {
                  ...sale,
                  items: saleItems
                };

                setSelectedSaleForPrint(saleWithItems);
              } catch (error) {
                console.error('Error loading sale items for printing:', error);
                // Fallback to current sale data
                const latestSale = sales.find(s => s.id === sale.id);
                setSelectedSaleForPrint(latestSale || sale);
              } finally {
                setIsLoadingInvoice(false);
              }
            }}
            className="text-green-600 hover:text-green-800"
            title="Print Invoice"
            disabled={isLoadingInvoice}
          >
            {isLoadingInvoice ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            ) : (
              <Printer size={16} />
            )}
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
        <div className="p-4 border-b">
          <SearchBar
            placeholder="Search sales..."
            onSearch={setSearchTerm}
            onFilterChange={setSearchFilter}
            filterOptions={[
              { value: 'invoiceNumber', label: 'Invoice Number' },
              { value: 'customerName', label: 'Customer Name' },
              { value: 'saleDate', label: 'Sale Date' },
              { value: 'status', label: 'Status' }
            ]}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading sales...</span>
          </div>
        ) : (
          <Table
            key={`sales-${filteredSales.length}`}
            columns={columns}
            data={filteredSales}
          />
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
            amountPaid: 0,
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => {
                  const amountPaid = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, amountPaid });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remaining Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={saleItems.length > 0 ? 
                  (saleItems.reduce((sum, item) => sum + item.total, 0) - formData.amountPaid).toFixed(2) : 
                  '0.00'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              />
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
                  <div className="flex flex-col">
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

                    {/* Show old battery form under item name for battery products */}
                    {item.productId && products.find(p => p.id === item.productId)?.isBattery && (
                      <div className="mt-2 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const oldBatteryData = item.oldBatteryData ? null : { name: '', weight: 0, ratePerKg: 0, deductionAmount: 0 };
                            handleOldBatteryChange(index, oldBatteryData);
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                          title="Add/Remove Old Battery"
                        >
                          <Battery size={16} className="mr-1" />
                          <span className="text-xs">Include Old Battery</span>
                        </button>
                      </div>
                    )}

                    {item.oldBatteryData && (
                      <div className="relative z-10" style={{ pointerEvents: 'auto' }}>
                        <OldBatteryForm
                          enabled={true}
                          initialData={item.oldBatteryData}
                          onOldBatteryChange={(data) => handleOldBatteryChange(index, data)}
                        />
                      </div>
                    )}
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
                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => removeSaleItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

      {selectedSaleForPrint && selectedSaleForPrint.id && (
        <InvoicePrint
          key={`invoice-${selectedSaleForPrint.id}-${selectedSaleForPrint.items?.length || 0}`}
          sale={selectedSaleForPrint}
          customer={customers.find(c => c.id === selectedSaleForPrint.customerId)}
          products={products}
          onClose={() => {
            console.log('Closing invoice print - clearing state');
            isClosingRef.current = true;
            setSelectedSaleForPrint(null);
            setIsLoadingInvoice(false);
            // Reset the closing flag after a short delay
            setTimeout(() => {
              isClosingRef.current = false;
              console.log('State cleared, selectedSaleForPrint should be null');
            }, 200);
          }}
          isLoading={isLoadingInvoice}
        />
      )}
    </div>
  );
};

export default SalesList;