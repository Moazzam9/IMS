import React, { useState, useEffect } from 'react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import { Search, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Expense } from '../../types';

const SearchReport: React.FC = () => {
  const { expenseHeads, expenses: allExpenses } = useApp();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  // Filter expenses when search criteria change or when allExpenses changes
  useEffect(() => {
    if (allExpenses.length > 0 && (startDate || endDate || category)) {
      handleSearch();
    } else {
      setFilteredExpenses(allExpenses);
    }
  }, [allExpenses]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setLoading(true);
    
    try {
      // Filter expenses based on search criteria
      let filtered = [...allExpenses];
      
      if (startDate) {
        filtered = filtered.filter(expense => expense.date >= startDate);
      }
      
      if (endDate) {
        filtered = filtered.filter(expense => expense.date <= endDate);
      }
      
      if (category) {
        filtered = filtered.filter(expense => expense.category === category);
      }
      
      setFilteredExpenses(filtered);
    } catch (error) {
      console.error('Error searching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality removed as requested

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { key: 'category', label: 'Category' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value: number) => `₨${value.toLocaleString()}`
    },
    { key: 'description', label: 'Description' },
    { 
      key: 'paymentMethod', 
      label: 'Payment Method',
      render: (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
    }
  ];

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Search & Report</h1>
          <p className="text-gray-600">Search and generate expense reports</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {expenseHeads.map((head) => (
                    <option key={head.id} value={head.name}>{head.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" icon={Search} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Searching expenses...</span>
        </div>
      ) : filteredExpenses.length > 0 ? (
        <>
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Expense Report</h2>
            </div>
            <Table columns={columns} data={filteredExpenses} />
          </Card>
          
          <Card>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="text-blue-500 mr-2" size={20} />
                <span className="text-gray-700">
                  {startDate ? new Date(startDate).toLocaleDateString() : 'All time'} 
                  {endDate ? ` - ${new Date(endDate).toLocaleDateString()}` : ''}
                </span>
              </div>
              <div>
                <span className="text-gray-700 mr-2">Total:</span>
                <span className="text-xl font-bold text-blue-600">₨{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default SearchReport;