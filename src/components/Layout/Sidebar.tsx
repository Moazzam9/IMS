import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Settings,
  User,
  Boxes,
  UserCog,
  DollarSign,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Search,
  List
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [expenseDropdownOpen, setExpenseDropdownOpen] = useState(false);
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/suppliers', icon: Users, label: 'Suppliers' },
    { to: '/customers', icon: User, label: 'Customers' },
    { to: '/staff', icon: UserCog, label: 'Staff' },
    { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
    { to: '/sales', icon: TrendingUp, label: 'Sales' },
    { to: '/stock', icon: Boxes, label: 'Stock' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-nihal-blue text-white">
        <h1 className="text-xl font-bold">Nihal Battery House</h1>
        <p className="text-sm text-nihal-yellow">& Free Oil Change</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-nihal-light-blue text-nihal-blue border-r-2 border-nihal-yellow'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-nihal-blue'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
          
          {/* Expense Section with Dropdown */}
          <li>
            <button
              onClick={() => setExpenseDropdownOpen(!expenseDropdownOpen)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-nihal-blue"
            >
              <div className="flex items-center space-x-3">
                <DollarSign size={20} />
                <span className="font-medium">Expense</span>
              </div>
              {expenseDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expenseDropdownOpen && (
              <ul className="mt-1 ml-7 space-y-1">
                <li>
                  <NavLink
                    to="/expense/add"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive
                        ? 'bg-nihal-light-blue text-nihal-blue border-r-2 border-nihal-yellow'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-nihal-blue'
                      }`
                    }
                  >
                    <PlusCircle size={16} />
                    <span className="font-medium">Add Expense</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/expense/search"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive
                        ? 'bg-nihal-light-blue text-nihal-blue border-r-2 border-nihal-yellow'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-nihal-blue'
                      }`
                    }
                  >
                    <Search size={16} />
                    <span className="font-medium">Search and Report</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/expense/head"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive
                        ? 'bg-nihal-light-blue text-nihal-blue border-r-2 border-nihal-yellow'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-nihal-blue'
                      }`
                    }
                  >
                    <List size={16} />
                    <span className="font-medium">Expense Head</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;