import React, { useState } from 'react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { PlusCircle, Save } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';

interface ExpenseFormData {
  date: string;
  category: string;
  amount: string;
  paymentMethod: string;
  description: string;
}

const AddExpense: React.FC = () => {
  const { expenseHeads, addExpense } = useApp();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    paymentMethod: 'cash',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save expense to Firebase
      await addExpense({
        date: formData.date,
        category: formData.category,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        description: formData.description,
      });
      
      // Reset form after successful submission
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        paymentMethod: 'cash',
        description: ''
      });
      
      showToast('Expense added successfully!', 'success');
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Failed to add expense. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
          <p className="text-gray-600">Record a new expense</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {expenseHeads.map((head) => (
                  <option key={head.id} value={head.name}>{head.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₨) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="credit">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense description (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" icon={Save} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddExpense;