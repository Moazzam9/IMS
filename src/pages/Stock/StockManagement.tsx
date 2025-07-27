import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import { StockMovement, Product } from '../../types';
import { Calendar, Package2 } from 'lucide-react';

const StockManagement: React.FC = () => {
  const { stockMovements, products, suppliers, loading } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  
  // Filter stock movements by selected product
  const filteredMovements = selectedProduct
    ? stockMovements.filter(movement => movement.productId === selectedProduct)
    : stockMovements;

  // Sort movements by date (newest first)
  const sortedMovements = [...filteredMovements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const columns = [
    { 
      key: 'productId', 
      label: 'Product',
      render: (value: string) => {
        const product = products.find(p => p.id === value);
        return product ? product.name : 'Unknown';
      }
    },
    { 
      key: 'type', 
      label: 'Movement Type',
      render: (value: string) => {
        const typeLabels: Record<string, string> = {
          'purchase': 'Purchase',
          'sale': 'Sale',
          'return_purchase': 'Purchase Return',
          'return_sale': 'Sale Return',
          'transfer_in': 'Transfer In',
          'transfer_out': 'Transfer Out'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value.includes('purchase') || value === 'transfer_in' || value === 'return_sale'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {typeLabels[value] || value}
          </span>
        );
      }
    },
    { 
      key: 'quantity', 
      label: 'Quantity',
      render: (value: number, movement: StockMovement) => {
        const isPositive = ['purchase', 'return_sale', 'transfer_in'].includes(movement.type);
        return (
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : '-'}{Math.abs(value)}
          </span>
        );
      }
    },
    { 
      key: 'date', 
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'referenceType', 
      label: 'Reference',
      render: (value: string, movement: StockMovement) => {
        return `${value.charAt(0).toUpperCase() + value.slice(1)} #${movement.referenceId.substring(0, 8)}`;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600">Track your inventory movements and stock levels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
              <Package2 className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold mt-2">{products.length}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
              <Package2 className="text-yellow-500" size={24} />
            </div>
            <p className="text-3xl font-bold mt-2">
              {products.filter(p => p.currentStock <= (p.minStockLevel || 0)).length}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Stock Movements</h3>
              <Calendar className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold mt-2">{stockMovements.length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Stock Movement History</h2>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Current Stock: {product.currentStock}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading stock movements...</span>
          </div>
        ) : (
          <Table columns={columns} data={sortedMovements} />
        )}
      </Card>

      {selectedProduct && (
        <Card>
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Stock Card</h2>
          </div>
          <div className="p-4">
            {(() => {
              const product = products.find(p => p.id === selectedProduct);
              if (!product) return <p>Product not found</p>;
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Product Name</p>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{product.category || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Current Stock</p>
                      <p className="font-medium">{product.currentStock} {product.unit}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Min Stock Level</p>
                      <p className="font-medium">{product.minStockLevel || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Trade Price</p>
              <p className="font-medium">₨{product.tradePrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Sale Price</p>
              <p className="font-medium">₨{product.salePrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Profit Margin</p>
                      <p className="font-medium">
                        {((product.salePrice - product.tradePrice) / product.tradePrice * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Stock Value</p>
              <p className="font-medium">₨{(product.currentStock * product.tradePrice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StockManagement;