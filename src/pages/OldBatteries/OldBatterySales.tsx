import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import { Battery, Plus, Search, TrendingUp, Edit, Trash2, Printer } from 'lucide-react';
import { OldBattery } from '../../types';
import { OldBatteryService } from '../../services/oldBatteryService';
import { useApp } from '../../contexts/AppContext';
import OldBatteryPrint from '../../components/OldBatteries/OldBatteryPrint';

const OldBatterySales: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { sales } = useApp();
  const [oldBatteries, setOldBatteries] = useState<OldBattery[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('invoiceNumber');
  const [searchResults, setSearchResults] = useState<OldBattery[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    customerName: '',
    salesperson: '',
    saleDate: new Date().toISOString().split('T')[0],
    discount: 0,
    amountPaid: 0,
    status: 'completed'
  });
  
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<OldBattery | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [selectedBatteryForPrint, setSelectedBatteryForPrint] = useState<OldBattery | null>(null);
  
  const [newOldBattery, setNewOldBattery] = useState({
    name: '',
    weight: 0,
    ratePerKg: 0,
    deductionAmount: 0,
    saleId: 'manual-entry-sale',
    saleItemId: 'manual-entry-item'
  });
  
  // Load old battery sales from the new collection and generate next invoice number
  useEffect(() => {
    const loadOldBatterySales = async () => {
      try {
        // Get all old battery sales for this user from the new collection
        const data = await OldBatteryService.getOldBatterySales(user?.firebaseUid || '');
        
        // Map the data to include all required fields for the table
        const mappedData = data.map(sale => ({
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          customerName: sale.customerName,
          saleDate: sale.saleDate,
          name: sale.oldBatteryDetails?.name,
          weight: sale.oldBatteryDetails?.weight,
          ratePerKg: sale.oldBatteryDetails?.ratePerKg,
          deductionAmount: sale.oldBatteryDetails?.deductionAmount || sale.totalAmount,
          discount: sale.discount || 0,
          amountPaid: sale.amountPaid || 0,
          status: sale.status || 'completed'
        }));
        
        // No filtering needed as we're now using a dedicated sales collection
        setOldBatteries(mappedData);
        
        // Generate next invoice number
        generateNextInvoiceNumber(data);
      } catch (error) {
        console.error('Error loading old battery sales:', error);
        showToast('Error loading old battery sales', 'error');
      }
    };
    
    if (user?.firebaseUid) {
      loadOldBatterySales();
    }
  }, [showToast, user?.firebaseUid]);
  
  // Function to generate the next invoice number
  const generateNextInvoiceNumber = (sales: any[]) => {
    try {
      // Extract existing invoice numbers that follow our format (OB-001, OB-002, etc.)
      const invoiceNumbers = sales
        .map(sale => sale.invoiceNumber)
        .filter(num => num && num.startsWith('OB-'))
        .map(num => {
          const numPart = num.split('-')[1];
          return numPart ? parseInt(numPart, 10) : 0;
        });
      
      // Find the highest number
      const highestNumber = invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) : 0;
      
      // Generate the next number with padding
      const nextNumber = highestNumber + 1;
      const paddedNumber = nextNumber.toString().padStart(3, '0');
      const nextInvoiceNumber = `OB-${paddedNumber}`;
      
      // Update the form data with the new invoice number
      setFormData(prev => ({
        ...prev,
        invoiceNumber: nextInvoiceNumber
      }));
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to a default format if there's an error
      const timestamp = new Date().getTime().toString().slice(-6);
      setFormData(prev => ({
        ...prev,
        invoiceNumber: `OB-${timestamp}`
      }));
    }
  };
  
  // Handle edit old battery sale
  const handleEdit = (sale: OldBattery) => {
    setEditingSale(sale);
    setFormData({
      invoiceNumber: sale.invoiceNumber || '',
      customerId: sale.customerId || '',
      customerName: sale.customerName || '',
      salesperson: sale.salesperson || '',
      saleDate: sale.saleDate || new Date().toISOString().split('T')[0],
      discount: sale.discount || 0,
      amountPaid: sale.amountPaid || 0,
      status: sale.status || 'completed'
    });
    
    setNewOldBattery({
      name: sale.name || '',
      weight: sale.weight || 0,
      ratePerKg: sale.ratePerKg || 0,
      deductionAmount: sale.deductionAmount || 0,
      saleId: sale.saleId || 'manual-entry-sale',
      saleItemId: sale.saleItemId || 'manual-entry-item'
    });
    
    setIsModalOpen(true);
  };
  
  // Handle delete old battery sale
  const handleDelete = async (saleId: string) => {
    if (window.confirm('Are you sure you want to delete this old battery sale?')) {
      try {
        await OldBatteryService.deleteOldBatterySale(saleId, user?.firebaseUid || '');
        showToast('Old battery sale deleted successfully', 'success');
        
        // Reload old batteries
        const data = await OldBatteryService.getOldBatterySales(user?.firebaseUid || '');
        const mappedData = data.map(sale => ({
          id: sale.id,
          invoiceNumber: sale.invoiceNumber,
          customerName: sale.customerName,
          saleDate: sale.saleDate,
          name: sale.oldBatteryDetails?.name,
          weight: sale.oldBatteryDetails?.weight,
          ratePerKg: sale.oldBatteryDetails?.ratePerKg,
          deductionAmount: sale.oldBatteryDetails?.deductionAmount || sale.totalAmount,
          discount: sale.discount || 0,
          amountPaid: sale.amountPaid || 0,
          status: sale.status || 'completed'
        }));
        setOldBatteries(mappedData);
      } catch (error) {
        console.error('Error deleting old battery sale:', error);
        showToast('Error deleting old battery sale', 'error');
      }
    }
  };
  
  // Handle print old battery sale invoice
  const handlePrint = (sale: OldBattery) => {
    // Prevent multiple clicks
    if (isLoadingInvoice) {
      console.log('Already loading invoice, ignoring click');
      return;
    }
    
    try {
      console.log('Print button clicked for old battery sale:', sale.id);
      // Set loading state to true initially
      setIsLoadingInvoice(true);
      // Set the selected battery for print
      setSelectedBatteryForPrint(sale);
      
      // Reset loading state after a short delay to ensure data is loaded
      setTimeout(() => {
        setIsLoadingInvoice(false);
      }, 300);
    } catch (error) {
      console.error('Error preparing invoice for print:', error);
      showToast('Error preparing invoice for print', 'error');
      setIsLoadingInvoice(false);
    }
  };

  // Close print modal
  const handleClosePrintModal = () => {
    console.log('Closing old battery print modal');
    // Simply reset the state without complex timeouts
    setSelectedBatteryForPrint(null);
    setIsLoadingInvoice(false);
    console.log('Old battery print data cleared and loading state reset');
  };

  // Filter old batteries based on search term and filter
  const filteredOldBatteries = useMemo(() => {
    if (!searchTerm.trim()) return oldBatteries;
    
    return oldBatteries.filter(sale => {
      const term = searchTerm.toLowerCase();
      
      switch (searchFilter) {
        case 'invoiceNumber':
          return sale.invoiceNumber?.toLowerCase().includes(term);
        case 'customerName':
          return (sale.customerName || 'Walk-in Customer').toLowerCase().includes(term);
        case 'saleDate':
          return new Date(sale.saleDate).toLocaleDateString().toLowerCase().includes(term);
        case 'status':
          return sale.status?.toLowerCase().includes(term);
        default:
          return true;
      }
    });
  }, [oldBatteries, searchTerm, searchFilter]);
  
  // Search for old batteries (for the modal)
  const searchOldBatteries = async (term: string, filter: string = 'name') => {
    if (!user?.firebaseUid || !term.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const allBatteries = await OldBatteryService.getOldBatteryStock(user.firebaseUid);
      const filteredResults = allBatteries.filter(battery => {
        if (filter === 'name') {
          return battery.name.toLowerCase().includes(term.toLowerCase());
        } else if (filter === 'weight') {
          return battery.weight.toString().includes(term);
        } else if (filter === 'ratePerKg') {
          return battery.ratePerKg.toString().includes(term);
        }
        return false;
      });
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching old batteries:', error);
      showToast('Error searching old batteries', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate deduction amount whenever weight or rate changes
  useEffect(() => {
    const weight = newOldBattery.weight || 0;
    const ratePerKg = newOldBattery.ratePerKg || 0;
    const deductionAmount = weight * ratePerKg;

    setNewOldBattery(prev => ({
      ...prev,
      deductionAmount
    }));
  }, [newOldBattery.weight, newOldBattery.ratePerKg]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'searchTerm') {
      setSearchTerm(value);
      return;
    }

    if (name === 'name') {
      setNewOldBattery(prev => ({ ...prev, [name]: value }));
      return;
    }

    // Handle numeric fields (weight and ratePerKg)
    const numericValue = value === '' ? 0 : Number(value);
    if (!isNaN(numericValue)) {
      setNewOldBattery(prev => ({ ...prev, [name]: numericValue }));
    }
  };

  const handleSelectBattery = (battery: OldBattery) => {
    setNewOldBattery({
      name: battery.name,
      weight: battery.weight,
      ratePerKg: battery.ratePerKg,
      deductionAmount: battery.deductionAmount,
      saleId: 'manual-entry-sale',
      saleItemId: 'manual-entry-item'
    });
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleAddOldBatterySale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.firebaseUid) {
      showToast('User authentication required', 'error');
      return;
    }

    if (!formData.invoiceNumber || !formData.saleDate) {
      showToast('Please fill in all required invoice fields', 'error');
      return;
    }

    if (!newOldBattery.name || !newOldBattery.weight || !newOldBattery.ratePerKg) {
      showToast('Please fill in all old battery details', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new old battery sale with the form data
      const oldBatterySaleData = {
        ...newOldBattery,
        invoiceNumber: formData.invoiceNumber,
        customerId: formData.customerId,
        customerName: formData.customerName,
        salesperson: formData.salesperson,
        saleDate: formData.saleDate,
        status: formData.status,
        amountPaid: formData.amountPaid,
        totalAmount: newOldBattery.deductionAmount,
        discount: formData.discount,
        remainingBalance: newOldBattery.deductionAmount - formData.amountPaid
      };

      if (editingSale) {
        // Update existing sale
        await OldBatteryService.updateOldBatterySale(
          editingSale.id,
          oldBatterySaleData,
          user.firebaseUid
        );
        showToast('Old battery sale updated successfully', 'success');
      } else {
        // Add new sale
        await OldBatteryService.addOldBattery(oldBatterySaleData, user.firebaseUid);
        showToast('Old battery sale added successfully', 'success');
      }
      
      setIsModalOpen(false);
      
      // Reset form
      setNewOldBattery({
        name: '',
        weight: 0,
        ratePerKg: 0,
        deductionAmount: 0,
        saleId: 'manual-entry-sale',
        saleItemId: 'manual-entry-item'
      });
      
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
      setEditingSale(null);
      
      // Reload old batteries
      const data = await OldBatteryService.getOldBatterySales(user.firebaseUid);
      const mappedData = data.map(sale => ({
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName,
        saleDate: sale.saleDate,
        name: sale.oldBatteryDetails?.name,
        weight: sale.oldBatteryDetails?.weight,
        ratePerKg: sale.oldBatteryDetails?.ratePerKg,
        deductionAmount: sale.oldBatteryDetails?.deductionAmount || sale.totalAmount,
        discount: sale.discount || 0,
        amountPaid: sale.amountPaid || 0,
        status: sale.status || 'completed'
      }));
      setOldBatteries(mappedData);
    } catch (error) {
      console.error(`Error ${editingSale ? 'updating' : 'adding'} old battery sale:`, error);
      showToast(`Error ${editingSale ? 'updating' : 'adding'} old battery sale`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Print Modal */}
      {selectedBatteryForPrint && (
        <OldBatteryPrint
          key={`invoice-${selectedBatteryForPrint.id}-${Date.now()}`}
          oldBattery={selectedBatteryForPrint}
          onClose={handleClosePrintModal}
          isLoading={isLoadingInvoice}
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Battery size={24} className="mr-2 text-blue-600" />
            Old Battery Sales
          </h1>
          <p className="text-gray-600">View records of old batteries currently being sold (not previously purchased) with sale information</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Old Battery Sale
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchBar
            placeholder="Search old battery sales..."
            onSearch={setSearchTerm}
            onFilterChange={setSearchFilter}
            filters={[
              { value: 'invoiceNumber', label: 'Invoice Number' },
              { value: 'customerName', label: 'Customer Name' },
              { value: 'saleDate', label: 'Sale Date' },
              { value: 'status', label: 'Status' }
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Battery Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOldBatteries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    {oldBatteries.length === 0 ? 'No old battery sales found. Add your first old battery sale.' : 'No matching records found.'}
                  </td>
                </tr>
              ) : (
                filteredOldBatteries.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sale.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sale.customerName || 'Walk-in Customer'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sale.name} - {sale.weight} kg @ ₨{sale.ratePerKg}/kg
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₨{(sale.deductionAmount || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₨{(sale.discount || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₨{((sale.deductionAmount || 0) - (sale.discount || 0)).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₨{(sale.amountPaid || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">₨{(((sale.deductionAmount || 0) - (sale.discount || 0)) - (sale.amountPaid || 0)).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {sale.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                          onClick={() => handlePrint(sale)}
                          className="text-green-600 hover:text-green-800"
                          title="Print Invoice"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
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
        title={editingSale ? 'Edit Old Battery Sale' : 'Add Old Battery Sale'}
        size="xl"
      >
        <form onSubmit={handleAddOldBatterySale} className="space-y-6">
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
                {/* Add customer options here if needed */}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
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
                  setFormData({ ...formData, amountPaid: amountPaid });
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
                value={Math.max(0, (newOldBattery.deductionAmount || 0) - formData.amountPaid).toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sale Items</h3>
              <Button 
                type="button" 
                onClick={() => {
                  setSaleItems([...saleItems, {
                    productId: '',
                    quantity: 1,
                    salePrice: 0,
                    discount: 0,
                    total: 0
                  }]);
                }}
                size="sm"
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {/* Old Battery Form */}
              <div className="p-4 bg-white border rounded-md">
                <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-gray-700">
                  <div className="col-span-4">Name/Reference *</div>
                  <div className="col-span-2">Weight (kg) *</div>
                  <div className="col-span-2">Rate per Kg *</div>
                  <div className="col-span-2">Deduction Amount</div>
                  <div className="col-span-2"></div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <div className="mb-2">
                    <SearchBar
                      placeholder="Search old battery stock..."
                      className="w-full"
                      onSearch={(term, filter) => searchOldBatteries(term, filter)}
                      value={searchTerm}
                      filters={[
                        { value: 'name', label: 'Name' },
                        { value: 'weight', label: 'Weight' },
                        { value: 'ratePerKg', label: 'Rate' }
                      ]}
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((battery) => (
                        <div
                          key={battery.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectBattery(battery)}
                        >
                          <div className="font-medium">{battery.name}</div>
                          <div className="text-sm text-gray-600">
                            {battery.weight} kg @ ₨{battery.ratePerKg}/kg
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    name="name"
                    value={newOldBattery.name}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="e.g. Customer's old battery"
                    required
                  />
                </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      name="weight"
                      value={newOldBattery.weight || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      step="0.01"
                      placeholder="Enter weight"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      name="ratePerKg"
                      value={newOldBattery.ratePerKg || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                      step="0.01"
                      placeholder="Enter rate"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="w-full px-2 py-1 border border-gray-300 bg-gray-50 rounded text-sm">
                      ₨{newOldBattery.deductionAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sale Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total Items: 1</span>
                <div className="space-x-4">
                  <span>Subtotal: ₨{newOldBattery.deductionAmount.toFixed(2)}</span>
                  <span>Discount: ₨0.00</span>
                  <span className="font-medium">Net Amount: ₨{newOldBattery.deductionAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" icon={TrendingUp} disabled={isSubmitting}>
              {isSubmitting ? (editingSale ? 'Updating...' : 'Adding...') : (editingSale ? 'Update Old Battery Sale' : 'Add Old Battery Sale')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OldBatterySales;