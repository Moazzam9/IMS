import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import { Battery, Plus } from 'lucide-react';
import { OldBattery } from '../../types';
import { OldBatteryService } from '../../services/oldBatteryService';

const OldBatteriesList: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [oldBatteries, setOldBatteries] = useState<OldBattery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOldBattery, setNewOldBattery] = useState({
    name: '',
    weight: 0,
    ratePerKg: 0,
    deductionAmount: 0,
    saleId: 'manual-entry',
    saleItemId: 'manual-entry',
    status: 'completed' as 'completed' | 'pending',
    amountPaid: 0,
    discount: 0,
    quantity: 1
  });
  
  // Load old batteries
  useEffect(() => {
    const loadOldBatteries = async () => {
      try {
        setLoading(true);
        const data = await OldBatteryService.getOldBatteries(user?.firebaseUid || '');
        setOldBatteries(data);
      } catch (error) {
        console.error('Error loading old batteries:', error);
        showToast('Error loading old batteries', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.firebaseUid) {
      loadOldBatteries();
    }
  }, [showToast, user?.firebaseUid]);
  
  // Filter old batteries based on search term and filter
  const filteredOldBatteries = useMemo(() => {
    if (!searchTerm) return oldBatteries;
    
    return oldBatteries.filter(battery => {
      const value = battery[searchFilter as keyof OldBattery];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  }, [oldBatteries, searchTerm, searchFilter]);
  
  // State for storing battery stock data
  const [stockData, setStockData] = useState<any[]>([]);
  
  // Fetch battery stock data when oldBatteries changes
  useEffect(() => {
    const fetchStockData = async () => {
      if (user?.firebaseUid) {
        try {
          const stock = await OldBatteryService.getOldBatteryStock(user.firebaseUid);
          setStockData(stock);
        } catch (error) {
          console.error('Error fetching battery stock:', error);
        }
      }
    };
    
    fetchStockData();
  }, [user?.firebaseUid, oldBatteries]); // Re-fetch when oldBatteries changes
  
  // Group batteries by name and calculate total quantities, accounting for sold batteries
  const groupedBatteries = useMemo(() => {
    // Map the stock data to the format expected by the component
    return stockData.map(battery => {
      return {
        name: battery.name,
        totalWeight: battery.weight || 0,
        count: battery.quantity || 0,
        // Use the originalUnitWeight property from the service if available
        // This ensures unit weight remains constant even when quantity is zero
        unitWeight: battery.originalUnitWeight || (battery.quantity > 0 ? battery.weight / battery.quantity : 0)
      };
    });
  }, [stockData]);
  
  const summaryColumns = [
    { key: 'name', label: 'Battery Name' },
    { key: 'count', label: 'Quantity' },
    { 
      key: 'unitWeight', 
      label: 'Unit Weight (kg)',
      render: (value: number) => value.toFixed(2)
    },
    { 
      key: 'totalWeight', 
      label: 'Total Weight (kg)',
      render: (value: number) => value.toFixed(2)
    }
  ];
  
  const columns = [
    { key: 'name', label: 'Name/Reference' },
    { 
      key: 'quantity', 
      label: 'Quantity',
      render: (value: number) => value || 1
    },
    { 
      key: 'weight', 
      label: 'Weight (kg)',
      render: (value: number) => value.toFixed(2)
    },
    { 
      key: 'ratePerKg', 
      label: 'Rate per Kg',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'deductionAmount', 
      label: 'Purchase Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  // Calculate deduction amount whenever weight, rate, or quantity changes
  useEffect(() => {
    const weight = newOldBattery.weight || 0;
    const ratePerKg = newOldBattery.ratePerKg || 0;
    const quantity = newOldBattery.quantity || 1;
    const deductionAmount = weight * ratePerKg * quantity;

    setNewOldBattery(prev => ({
      ...prev,
      deductionAmount
    }));
  }, [newOldBattery.weight, newOldBattery.ratePerKg, newOldBattery.quantity]);

  // Function to search for battery in the Battery Summary table
  const searchBattery = (batteryName: string) => {
    if (!batteryName) return false;
    
    const foundBattery = groupedBatteries.find(battery => 
      battery.name.toLowerCase() === batteryName.toLowerCase()
    );
    
    if (foundBattery) {
      // Find the first matching battery in the detailed records to get rate per kg
      const batteryDetails = oldBatteries.find(battery => 
        battery.name.toLowerCase() === batteryName.toLowerCase()
      );
      
      if (batteryDetails) {
        // Update the form with the found battery details
        // Use the unit weight instead of total weight
        const weight = foundBattery.unitWeight > 0 ? foundBattery.unitWeight : 0;
        const ratePerKg = parseFloat(batteryDetails.ratePerKg.toString()) || 0;
        
        setNewOldBattery(prev => ({
          ...prev,
          name: foundBattery.name,
          weight: weight,
          ratePerKg: ratePerKg,
          quantity: 1 // Default to 1, user can adjust as needed
        }));
        
        console.log('Setting battery details:', { 
          name: foundBattery.name, 
          weight: weight, 
          ratePerKg: ratePerKg 
        });
        
        showToast(`Found battery: ${foundBattery.name}`, 'success');
        return true;
      }
    }
    return false;
  };
  
  // Handle search button click
  const handleSearchClick = () => {
    if (newOldBattery.name) {
      const found = searchBattery(newOldBattery.name);
      if (!found) {
        showToast(`No matching battery found for: ${newOldBattery.name}`, 'warning');
      }
    } else {
      showToast('Please enter a battery name to search', 'warning');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setNewOldBattery(prev => ({ ...prev, [name]: value }));
      // Try to search for the battery when name is entered or when it's changed
      if (value.length > 2) { // Only search if at least 3 characters are entered
        searchBattery(value);
      }
      return;
    }

    // Handle numeric fields (weight and ratePerKg)
    const numericValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numericValue)) {
      console.log(`Setting ${name} to:`, numericValue);
      setNewOldBattery(prev => ({ ...prev, [name]: numericValue }));
    }
  };

  const handleAddOldBattery = async () => {
    if (!user?.firebaseUid) {
      showToast('User authentication required', 'error');
      return;
    }

    if (!newOldBattery.name || !newOldBattery.weight || !newOldBattery.ratePerKg || !newOldBattery.quantity) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    if (newOldBattery.quantity < 1) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    // Check if there's enough quantity in stock
    const batteryInfo = groupedBatteries.find(b => b.name.toLowerCase() === newOldBattery.name.toLowerCase());
    if (batteryInfo && newOldBattery.quantity > batteryInfo.count) {
      showToast(`Not enough batteries in stock. Available: ${batteryInfo.count}`, 'error');
      return;
    }

    try {
      await OldBatteryService.addOldBattery(newOldBattery, user.firebaseUid);
      showToast('Old battery added successfully', 'success');
      setIsModalOpen(false);
      
      // Reset form
      setNewOldBattery({
        name: '',
        weight: 0,
        ratePerKg: 0,
        deductionAmount: 0,
        saleId: 'manual-entry',
        saleItemId: 'manual-entry',
        status: 'completed',
        amountPaid: 0,
        discount: 0,
        quantity: 1
      });
      
      // Reload old batteries
      setLoading(true);
      const data = await OldBatteryService.getOldBatteries(user.firebaseUid);
      setOldBatteries(data);
      setLoading(false);
    } catch (error) {
      console.error('Error adding old battery:', error);
      showToast('Error adding old battery', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Battery size={24} className="mr-2 text-blue-600" />
            Old Batteries
          </h1>
          <p className="text-gray-600">View records of old batteries collected during sales</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Old Battery
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchBar 
            placeholder="Search old batteries..."
            onSearch={(term, filter) => {
              setSearchTerm(term);
              setSearchFilter(filter);
            }}
            filters={[
              { value: 'name', label: 'Name' },
              { value: 'weight', label: 'Weight' },
              { value: 'ratePerKg', label: 'Rate' },
              { value: 'deductionAmount', label: 'Amount' }
            ]}
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading old batteries...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 px-6 pt-4">Battery Summary</h2>
              <p className="text-sm text-gray-600 px-6 pb-2">Grouped by battery name with combined quantities</p>
              <Table 
                columns={summaryColumns}
                data={groupedBatteries}
                emptyMessage="No battery data available"
              />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-800 px-6 pb-2">Detailed Records</h2>
              <Table 
                columns={columns}
                data={filteredOldBatteries}
                emptyMessage="No old batteries found"
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Old Battery"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name/Reference *
            </label>
            <div className="relative flex space-x-2">
              <div className="flex-grow">
                <input
                  type="text"
                  name="name"
                  value={newOldBattery.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Customer's old battery"
                  required
                  list="battery-options"
                />
                <datalist id="battery-options">
                  {groupedBatteries.map((battery) => (
                    <option key={battery.name} value={battery.name} />
                  ))}
                </datalist>
              </div>
              <button
                type="button"
                onClick={handleSearchClick}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Select from existing batteries or enter a new name</p>
            {newOldBattery.name && groupedBatteries.find(b => b.name.toLowerCase() === newOldBattery.name.toLowerCase()) && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
                <p className="font-medium text-blue-700">Battery Summary Info:</p>
                <p className="text-gray-700">
                  {(() => {
                    const batteryInfo = groupedBatteries.find(b => b.name.toLowerCase() === newOldBattery.name.toLowerCase());
                    return batteryInfo ? 
                      `Available: ${batteryInfo.count} units, Unit Weight: ${batteryInfo.unitWeight.toFixed(2)} kg, Total Weight: ${batteryInfo.totalWeight.toFixed(2)} kg` : '';
                  })()}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg) *
            </label>
            <input
              type="number"
              name="weight"
              value={newOldBattery.weight || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              placeholder="Enter weight"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate per Kg *
            </label>
            <input
              type="number"
              name="ratePerKg"
              value={newOldBattery.ratePerKg || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              placeholder="Enter rate per kg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={newOldBattery.quantity || 1}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              step="1"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deduction Amount
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700">
              ₨{newOldBattery.deductionAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddOldBattery}
            >
              Add Old Battery
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OldBatteriesList;