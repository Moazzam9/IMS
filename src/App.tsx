import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Dashboard from './pages/Dashboard';
import ProductsList from './pages/Products/ProductsList';
import SuppliersList from './pages/Suppliers/SuppliersList';
import CustomersList from './pages/Customers/CustomersList';
import PurchasesList from './pages/Purchases/PurchasesList';
import SalesList from './pages/Sales/SalesList';
import StockManagement from './pages/Stock/StockManagement';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<ProductsList />} />
      <Route path="/suppliers" element={<SuppliersList />} />
      <Route path="/customers" element={<CustomersList />} />
      <Route path="/purchases" element={<PurchasesList />} />
      <Route path="/sales" element={<SalesList />} />
      <Route path="/stock" element={<StockManagement />} />
      <Route path="/returns" element={<div className="p-6">Returns page coming soon...</div>} />
      <Route path="/transfers" element={<div className="p-6">Transfers page coming soon...</div>} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const { authView } = useAuth();
    console.log('Current auth view:', authView);
    return authView === 'login' ? <Login /> : <SignUp />;
  }

  return (
    <AppProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;