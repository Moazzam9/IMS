import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import SearchBar from '../../components/Common/SearchBar';
import { Battery } from 'lucide-react';
import { OldBattery } from '../../types';
import { OldBatteryService } from '../../services/oldBatteryService';

const OldBatteriesList: React.FC = () => {
  const { showToast } = useToast();
  const [oldBatteries, setOldBatteries] = useState<OldBattery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  
  // Load old batteries
  useEffect(() => {
    const loadOldBatteries = async () => {
      try {
        setLoading(true);
        const data = await OldBatteryService.getOldBatteries();
        setOldBatteries(data);
      } catch (error) {
        console.error('Error loading old batteries:', error);
        showToast('Error loading old batteries', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadOldBatteries();
  }, [showToast]);
  
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
    </div>
  );
};

export default OldBatteriesList;