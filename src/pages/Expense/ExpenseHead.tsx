import React, { useState, useEffect } from 'react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { ExpenseHead as ExpenseHeadType } from '../../types';

// Using the ExpenseHead type from types/index.ts

const ExpenseHead: React.FC = () => {
  const { expenseHeads, addExpenseHead, updateExpenseHead, deleteExpenseHead } = useApp();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState<ExpenseHeadType | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (head: ExpenseHeadType) => {
    setEditingHead(head);
    setFormData({
      name: head.name
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense head?')) {
      deleteExpenseHead(id)
        .then(() => {
          showToast('Expense head deleted successfully', 'success');
        })
        .catch((error) => {
          console.error('Error deleting expense head:', error);
          showToast('Failed to delete expense head', 'error');
        });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingHead) {
        // Update existing expense head
        await updateExpenseHead(editingHead.id, { name: formData.name });
        showToast('Expense head updated successfully', 'success');
      } else {
        // Add new expense head
        await addExpenseHead({ name: formData.name });
        showToast('Expense head added successfully', 'success');
      }
      
      // Reset form and close modal
      setFormData({ name: '' });
      setEditingHead(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving expense head:', error);
      showToast('Failed to save expense head', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Head ID', render: (_: any, head: ExpenseHeadType, index: number) => (
      <span>{index + 1}</span>
    )},
    { key: 'name', label: 'Head Name' },
    { key: 'createdAt', label: 'Created At', render: (_: any, head: ExpenseHeadType) => (
      <span>{new Date(head.createdAt).toLocaleString()}</span>
    )},
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, head: ExpenseHeadType) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(head)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(head.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Expense Heads</h1>
          <p className="text-gray-600">Manage expense categories</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Expense Head
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={expenseHeads} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHead(null);
          setFormData({ name: '' });
        }}
        title={editingHead ? 'Edit Expense Head' : 'Add Expense Head'}
      >
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Head ID
                  </label>
                  <input
                    type="text"
                    value={editingHead ? editingHead.id : 'Will be generated automatically'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Head Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                

                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingHead(null);
                      setFormData({ name: '' });
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingHead ? 'Update' : 'Save')}
                  </Button>
                </div>
              </form>
      </Modal>
    </div>
  );
};

export default ExpenseHead;