import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import { Plus, Edit, Trash2, UserCog } from 'lucide-react';
import { Staff } from '../../types';

const StaffList: React.FC = () => {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useApp();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('fullName');
  
  // Filter staff based on search term and filter
  const filteredStaff = useMemo(() => {
    if (!searchTerm) return staff;
    
    return staff.filter(staffMember => {
      const value = staffMember[searchFilter as keyof Staff];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  }, [staff, searchTerm, searchFilter]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    phone: '',
    category: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    status: 'active' as 'active' | 'resigned'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const staffData = {
        fullName: formData.fullName,
        cnic: formData.cnic,
        phone: formData.phone,
        category: formData.category,
        salary: parseFloat(formData.salary),
        joiningDate: formData.joiningDate,
        address: formData.address,
        status: formData.status
      };

      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
        showToast('Staff member updated successfully', 'success');
      } else {
        await addStaff(staffData);
        showToast('Staff member added successfully', 'success');
      }

      setIsModalOpen(false);
      setEditingStaff(null);
      setFormData({
        fullName: '',
        cnic: '',
        phone: '',
        category: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        address: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error saving staff member:', error);
      showToast('Error saving staff member. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      fullName: staffMember.fullName,
      cnic: staffMember.cnic,
      phone: staffMember.phone,
      category: staffMember.category,
      salary: staffMember.salary.toString(),
      joiningDate: staffMember.joiningDate,
      address: staffMember.address,
      status: staffMember.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(staffId);
        showToast('Staff member deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting staff member:', error);
        showToast('Error deleting staff member. Please try again.', 'error');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'cnic', label: 'CNIC' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'category', label: 'Category' },
    { 
      key: 'salary', 
      label: 'Salary',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'joiningDate', 
      label: 'Joining Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, staffMember: Staff) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(staffMember)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(staffMember.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600">Manage your staff members</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Staff
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchBar 
            placeholder="Search staff by name, CNIC, or category..."
            onSearch={(term, filter) => {
              setSearchTerm(term);
              setSearchFilter(filter);
            }}
            filters={[
              { value: 'fullName', label: 'Name' },
              { value: 'cnic', label: 'CNIC' },
              { value: 'phone', label: 'Phone' },
              { value: 'category', label: 'Category' },
              { value: 'status', label: 'Status' }
            ]}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading staff...</span>
          </div>
        ) : (
          <Table columns={columns} data={filteredStaff} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStaff(null);
          setFormData({
            fullName: '',
            cnic: '',
            phone: '',
            category: '',
            salary: '',
            joiningDate: new Date().toISOString().split('T')[0],
            address: '',
            status: 'active'
          });
        }}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleInputChange}
                required
                placeholder="00000-0000000-0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Salesman">Salesman</option>
                <option value="Technician">Technician</option>
                <option value="Manager">Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Helper">Helper</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary (₨) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2">Active</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="resigned"
                  checked={formData.status === 'resigned'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2">Resigned</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingStaff ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>{editingStaff ? 'Update Staff' : 'Add Staff'}</>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffList;