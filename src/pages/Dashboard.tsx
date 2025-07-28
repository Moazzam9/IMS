import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Common/Card';
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { products, suppliers, purchases, sales, loading } = useApp();
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      color: 'text-nihal-blue',
      bgColor: 'bg-nihal-light-blue'
    },
    {
      title: 'Suppliers',
      value: suppliers.length.toString(),
      icon: Users,
      color: 'text-nihal-blue',
      bgColor: 'bg-nihal-silver'
    },
    {
      title: 'Total Purchases',
      value: purchases.length.toString(),
      icon: ShoppingCart,
      color: 'text-nihal-blue',
      bgColor: 'bg-nihal-light-blue'
    },
    {
      title: 'Total Sales',
      value: sales.length.toString(),
      icon: TrendingUp,
      color: 'text-nihal-blue',
      bgColor: 'bg-nihal-silver'
    },
    {
      title: 'Low Stock Items',
      value: products.filter(p => p.currentStock < (p.minStockLevel || 10)).length.toString(),
      icon: AlertTriangle,
      color: 'text-nihal-blue',
      bgColor: 'bg-nihal-light-blue'
    },
    {
      title: 'Total Revenue',
      value: `₨${sales.reduce((sum, sale) => sum + sale.netAmount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-nihal-yellow',
      bgColor: 'bg-nihal-blue'
    }
  ];

  const lowStockProducts = products.filter(p => p.currentStock < (p.minStockLevel || 10)).slice(0, 5);
  // Get the 5 most recent sales (already sorted by newest first in AppContext)
  const recentSales = sales.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.username || 'User'}! Here's your inventory overview</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nihal-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Low Stock and Recent Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            <Card title="Low Stock Alert" className="h-fit">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-nihal-light-blue rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">Code: {product.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          Stock: {product.currentStock} {product.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {product.minStockLevel || 10}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No low stock items</p>
              )}
            </Card>

            {/* Recent Sales */}
            <Card title="Recent Sales" className="h-fit">
              {recentSales.length > 0 ? (
                <div className="space-y-3">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">#{sale.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          ₨{sale.netAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sale.totalItems} items
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent sales</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
