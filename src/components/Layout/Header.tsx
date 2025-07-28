import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-nihal-blue shadow-sm border-b border-nihal-silver">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Search bar removed */}
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-white hover:text-nihal-yellow hover:bg-nihal-light-blue rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-nihal-yellow capitalize">{user?.role}</p>
            </div>
            <div className="w-8 h-8 bg-nihal-light-blue rounded-full flex items-center justify-center">
              <User size={16} className="text-nihal-blue" />
            </div>
            <button
              onClick={logout}
              className="p-2 text-white hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-nihal-yellow h-[27px]"></div>
    </header>
  );
};

export default Header;