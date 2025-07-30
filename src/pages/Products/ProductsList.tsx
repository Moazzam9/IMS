import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import SearchBar from '../../components/Common/SearchBar';
import { Plus, Edit, Trash2, Package, Battery } from 'lucide-react';
import { Product } from '../../types';
import { FirebaseService } from '../../services/firebase';

const ProductsList: React.FC = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useApp();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilter, setSearchFilter] = useState('name');
  
  // Filter products based on search term and filter
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product => {
      const value = product[searchFilter as keyof Product];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      return false;
    });
  }, [products, searchTerm, searchFilter]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    tradePrice: '',
    salePrice: '',
    currentStock: '',
    minStockLevel: '',
    unit: 'pcs',
    isBattery: false,
    packing: '',
    retailer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const productData = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        tradePrice: parseFloat(formData.tradePrice),
        salePrice: parseFloat(formData.salePrice),
        currentStock: parseInt(formData.currentStock),
        minStockLevel: parseInt(formData.minStockLevel) || 10,
        isBattery: formData.isBattery,
        packing: formData.isBattery ? formData.packing : undefined,
        retailer: formData.isBattery ? formData.retailer : undefined
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        code: '',
        name: '',
        category: '',
        tradePrice: '',
        salePrice: '',
        currentStock: '',
        minStockLevel: '',
        unit: 'pcs',
        isBattery: false,
        packing: '',
        retailer: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Error saving product. Please try again.', 'error');
    }

    setIsSubmitting(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category || '',
      tradePrice: product.tradePrice.toString(),
      salePrice: product.salePrice.toString(),
      currentStock: product.currentStock.toString(),
      minStockLevel: product.minStockLevel?.toString() || '10',
      unit: product.unit,
      isBattery: product.isBattery || false,
      packing: product.packing || '',
      retailer: product.retailer || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error deleting product. Please try again.', 'error');
      }
    }
  };

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { 
      key: 'isBattery', 
      label: 'Type',
      render: (value: boolean) => value ? (
        <span className="flex items-center text-blue-600">
          <Battery size={16} className="mr-1" />
          Battery
        </span>
      ) : 'Regular'
    },
    { 
      key: 'tradePrice', 
      label: 'Trade Price',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'salePrice', 
      label: 'Sale Price',
      render: (value: number) => `₨${value.toFixed(2)}`
    },
    { 
      key: 'currentStock', 
      label: 'Stock',
      render: (value: number, row: Product) => (
        <span className={value < (row.minStockLevel || 10) ? 'text-red-600 font-medium' : 'text-gray-900'}>
          {value} {row.unit}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, product: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(product)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(product.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          <Button icon={Battery} onClick={() => {
            setFormData(prev => ({ ...prev, isBattery: true }));
            setIsModalOpen(true);
          }} variant="secondary">
            Add Battery
          </Button>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b">
          <SearchBar 
            placeholder="Search products by name, code, or category..."
            onSearch={(term, filter) => {
              setSearchTerm(term);
              setSearchFilter(filter);
            }}
            filters={[
              { value: 'name', label: 'Name' },
              { value: 'code', label: 'Code' },
              { value: 'category', label: 'Category' }
            ]}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <Table columns={columns} data={filteredProducts} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          setFormData({
            code: '',
            name: '',
            category: '',
            tradePrice: '',
            salePrice: '',
            currentStock: '',
            minStockLevel: '',
            unit: 'pcs'
          });
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Code *
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
                Product Name *
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
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="ltr">Liters</option>
                <option value="box">Boxes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trade Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.tradePrice}
                onChange={(e) => setFormData({ ...formData, tradePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stock Level
              </label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isBattery}
                onChange={(e) => setFormData({ ...formData, isBattery: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">This is a battery product</span>
            </label>
          </div>
          
          {formData.isBattery && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
              <h3 className="text-md font-medium text-blue-800 mb-3 flex items-center">
                <Battery size={18} className="mr-2" />
                Battery Specific Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packing
                  </label>
                  <input
                    type="text"
                    value={formData.packing}
                    onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 12V 150AH"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retailer
                  </label>
                  <input
                    type="text"
                    value={formData.retailer}
                    onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Exide, Phoenix"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" icon={Package}>
              {isSubmitting 
                ? (editingProduct ? 'Updating...' : 'Adding...') 
                : (editingProduct ? 'Update Product' : 'Add Product')
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsList;