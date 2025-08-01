import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import { Plus, Edit, Trash2, User, DollarSign } from 'lucide-react';
import { Customer, Sale } from '../../types';

const CustomersList: React.FC = () => {
  const { customers, sales, loading, addCustomer, updateCustomer, deleteCustomer, updateSale } = useApp();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentCustomer, setPaymentCustomer] = useState<Customer | null>(null);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [totalRemainingBalance, setTotalRemainingBalance] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Filter customers based on search term and filter
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;

    return customers.filter(customer => {
      const value = customer[searchFilter as keyof Customer];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  }, [customers, searchTerm, searchFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await addCustomer(formData);
      }

      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({
        code: '',
        name: '',
        phone: '',
        email: '',
        address: ''
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      showToast('Error saving customer. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
      } catch (error) {
        console.error('Error deleting customer:', error);
        showToast('Error deleting customer. Please try again.', 'error');
      }
    }
  };

  const handlePayment = (customer: Customer, sales: Sale[], balance: number) => {
    setPaymentCustomer(customer);
    setCustomerSales(sales);
    setTotalRemainingBalance(balance);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
  };

  const processPayment = async () => {
    if (!paymentCustomer || !paymentAmount || customerSales.length === 0) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0 || amount > totalRemainingBalance) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let remainingPayment = amount;
      
      // Sort sales by date (oldest first) to pay off oldest debts first
      const sortedSales = [...customerSales].sort((a, b) => 
        new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
      );

      // Update each sale's remaining balance until the payment is fully allocated
      for (const sale of sortedSales) {
        if (remainingPayment <= 0) break;
        
        if (sale.remainingBalance && sale.remainingBalance > 0) {
          const paymentForThisSale = Math.min(remainingPayment, sale.remainingBalance);
          
          const updatedRemainingBalance = sale.remainingBalance - paymentForThisSale;
          const updatedAmountPaid = sale.amountPaid + paymentForThisSale;
          
          await updateSale(sale.id, {
            remainingBalance: updatedRemainingBalance,
            amountPaid: updatedAmountPaid
          });
          
          remainingPayment -= paymentForThisSale;
        }
      }

      showToast(`Payment of Rs${amount.toFixed(2)} processed successfully`, 'success');
      setIsPaymentModalOpen(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      showToast('Error processing payment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { 
      key: 'remainingBalance', 
      label: 'Remaining Balance',
      render: (_: any, customer: Customer) => {
        // Calculate remaining balance from sales data
        const customerSales = sales.filter(sale => {
          // Check both customerId and customer name match
          return (sale.customerId === customer.id) || 
                 (sale.customerName && sale.customerName.toLowerCase() === customer.name.toLowerCase());
        });
        
        const totalRemainingBalance = customerSales.reduce((total, sale) => total + (sale.remainingBalance || 0), 0);
        
        return (
          <div className="flex items-center space-x-2">
            <span className={`font-medium ${totalRemainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalRemainingBalance > 0 ? `Rs${totalRemainingBalance.toFixed(2)}` : 'Rs0.00'}
            </span>
            {totalRemainingBalance > 0 && (
              <button 
                onClick={() => handlePayment(customer, customerSales, totalRemainingBalance)}
                className="text-blue-600 hover:text-blue-800 text-xs underline"
              >
                Pay
              </button>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, customer: Customer) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(customer)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(customer.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Customer
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchBar 
            placeholder="Search customers by name, code, or contact info..."
            onSearch={(term, filter) => {
              setSearchTerm(term);
              setSearchFilter(filter);
            }}
            filters={[
              { value: 'name', label: 'Name' },
              { value: 'code', label: 'Code' },
              { value: 'phone', label: 'Phone' },
              { value: 'email', label: 'Email' },
              { value: 'address', label: 'Address' }
            ]}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading customers...</span>
          </div>
        ) : (
          <Table columns={columns} data={filteredCustomers} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
          setFormData({
            code: '',
            name: '',
            phone: '',
            email: '',
            address: ''
          });
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" icon={User} disabled={isSubmitting}>
              {isSubmitting 
                ? (editingCustomer ? 'Updating...' : 'Adding...') 
                : (editingCustomer ? 'Update Customer' : 'Add Customer')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentCustomer(null);
          setPaymentAmount('');
        }}
        title="Process Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Customer</p>
            <p className="font-medium">{paymentCustomer?.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Remaining Balance</p>
            <p className="font-medium text-red-600">Rs{totalRemainingBalance.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Amount Paid by Customer
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={totalRemainingBalance}
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              icon={DollarSign} 
              onClick={processPayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Enter'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomersList;
