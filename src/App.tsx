import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
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
import OldBatteriesList from './pages/OldBatteries/OldBatteriesList';
import OldBatterySales from './pages/OldBatteries/OldBatterySales';
import { StaffList } from './pages/Staff';
import { AddExpense, SearchReport, ExpenseHead } from './pages/Expense';

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
      <Route path="/old-batteries/stock" element={<OldBatteriesList />} />
      <Route path="/old-batteries/sales" element={<OldBatterySales />} />
      <Route path="/staff" element={<StaffList />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      {/* Expense Routes */}
      <Route path="/expense/add" element={<AddExpense />} />
      <Route path="/expense/search" element={<SearchReport />} />
      <Route path="/expense/head" element={<ExpenseHead />} />
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
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;