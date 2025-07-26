import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  ArrowLeftRight,
  BarChart3,
  Settings,
  User,
  Boxes
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/suppliers', icon: Users, label: 'Suppliers' },
    { to: '/customers', icon: User, label: 'Customers' },
    { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
    { to: '/sales', icon: TrendingUp, label: 'Sales' },
    { to: '/stock', icon: Boxes, label: 'Stock' },
    { to: '/returns', icon: RotateCcw, label: 'Returns' },
    { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Inventory Pro</h1>
        <p className="text-sm text-gray-600">Management System</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;