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
    saleItemId: 'manual-entry'
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
  
  const columns = [
    { key: 'name', label: 'Name/Reference' },
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
      label: 'Deduction Amount',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

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

  const handleAddOldBattery = async () => {
    if (!user?.firebaseUid) {
      showToast('User authentication required', 'error');
      return;
    }

    if (!newOldBattery.name || !newOldBattery.weight || !newOldBattery.ratePerKg) {
      showToast('Please fill in all required fields', 'error');
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
        saleItemId: 'manual-entry'
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
          <Table 
            columns={columns}
            data={filteredOldBatteries}
            emptyMessage="No old batteries found"
          />
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
            <input
              type="text"
              name="name"
              value={newOldBattery.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Customer's old battery"
              required
            />
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