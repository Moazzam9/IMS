import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Supplier, Customer, Purchase, Sale, StockMovement } from '../types';
import { FirebaseService } from '../services/firebase';
import { useAuth } from './AuthContext';

interface AppContextType {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  purchases: Purchase[];
  sales: Sale[];
  stockMovements: StockMovement[];
  loading: boolean;
  
  // CRUD operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<string>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<string>;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  
  addSale: (sale: Omit<Sale, 'id'>) => Promise<string>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  
  addStockMovement: (stockMovement: Omit<StockMovement, 'id'>) => Promise<string>;
}

const AppContext = createContext<AppContextType>({ 
  products: [], 
  suppliers: [], 
  customers: [], 
  purchases: [], 
  sales: [], 
  stockMovements: [], 
  loading: true,
  addProduct: async () => '',
  updateProduct: async () => {},
  deleteProduct: async () => {},
  addSupplier: async () => '',
  updateSupplier: async () => {},
  deleteSupplier: async () => {},
  addCustomer: async () => '',
  updateCustomer: async () => {},
  deleteCustomer: async () => {},
  addPurchase: async () => '',
  updatePurchase: async () => {},
  deletePurchase: async () => {},
  addSale: async () => '',
  updateSale: async () => {},
  deleteSale: async () => {},
  addStockMovement: async () => ''
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.firebaseUid || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [electronReady, setElectronReady] = useState(false);

  // Initialize Electron connection
  useEffect(() => {
    if (isElectron()) {
      const handleReady = () => {
        setElectronReady(true);
      };

      const electronAPI = (window as any).electron;
      electronAPI?.receive('fromMain', handleReady);
      electronAPI?.send('app-ready', {});

      return () => {
        electronAPI?.removeListener('fromMain', handleReady);
      };
    } else {
      setElectronReady(true);
    }
  }, []);

  // Load data from Electron when ready
  useEffect(() => {
    if (isElectron() && electronReady) {
      // Try to load data from Electron storage
      loadData('appState')
        .then((result) => {
          if (result.success && result.data) {
            // Update your state with the loaded data
            console.log('Loaded data from Electron storage', result.data);
          }
        })
        .catch((error) => {
          console.error('Failed to load data from Electron storage', error);
        });
    }
  }, [electronReady]);

  // Save data to Electron when state changes
  useEffect(() => {
    if (isElectron() && electronReady) {
      // Create an object with all the data you want to persist
      const stateToSave = {
        // Include all state you want to save
        // products,
        // suppliers,
        // etc.
      };
      
      saveData('appState', stateToSave)
        .catch((error) => {
          console.error('Failed to save data to Electron storage', error);
        });
    }
  }, [electronReady, products, suppliers, customers, purchases, sales, stockMovements]);

  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeSuppliers: (() => void) | undefined;
    let unsubscribeCustomers: (() => void) | undefined;
    let unsubscribePurchases: (() => void) | undefined;
    let unsubscribeSales: (() => void) | undefined;
    let unsubscribeStockMovements: (() => void) | undefined;

    const initializeData = async () => {
      if (!userId) {
        // Reset all data when user logs out
        setProducts([]);
        setSuppliers([]);
        setCustomers([]);
        setPurchases([]);
        setSales([]);
        setStockMovements([]);
        setLoading(false);
        return;
      }
      
      try {
        // Subscribe to real-time updates with user ID
        unsubscribeProducts = FirebaseService.subscribeToProducts(setProducts, userId);
        unsubscribeSuppliers = FirebaseService.subscribeToSuppliers(setSuppliers, userId);
        unsubscribeCustomers = FirebaseService.subscribeToCustomers(setCustomers, userId);
        unsubscribePurchases = FirebaseService.subscribeToPurchases(setPurchases, userId);
        unsubscribeSales = FirebaseService.subscribeToSales(setSales, userId);
        unsubscribeStockMovements = FirebaseService.subscribeToStockMovements(setStockMovements, userId);
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup subscriptions on unmount or user change
    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeSuppliers) unsubscribeSuppliers();
      if (unsubscribeCustomers) unsubscribeCustomers();
      if (unsubscribePurchases) unsubscribePurchases();
      if (unsubscribeSales) unsubscribeSales();
      if (unsubscribeStockMovements) unsubscribeStockMovements();
    };
  }, [userId]);

  // CRUD operations that pass the current user ID
  const addProduct = async (product: Omit<Product, 'id'>) => {
    return await FirebaseService.addProduct(product, userId);
  };
  
  const updateProduct = async (id: string, product: Partial<Product>) => {
    await FirebaseService.updateProduct(id, product, userId);
  };
  
  const deleteProduct = async (id: string) => {
    await FirebaseService.deleteProduct(id, userId);
  };
  
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    return await FirebaseService.addSupplier(supplier, userId);
  };
  
  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    await FirebaseService.updateSupplier(id, supplier, userId);
  };
  
  const deleteSupplier = async (id: string) => {
    await FirebaseService.deleteSupplier(id, userId);
  };
  
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    return await FirebaseService.addCustomer(customer, userId);
  };
  
  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    await FirebaseService.updateCustomer(id, customer, userId);
  };
  
  const deleteCustomer = async (id: string) => {
    await FirebaseService.deleteCustomer(id, userId);
  };
  
  const addPurchase = async (purchase: Omit<Purchase, 'id'>) => {
    return await FirebaseService.addPurchase(purchase, userId);
  };
  
  const updatePurchase = async (id: string, purchase: Partial<Purchase>) => {
    await FirebaseService.updatePurchase(id, purchase, userId);
  };
  
  const deletePurchase = async (id: string) => {
    await FirebaseService.deletePurchase(id, userId);
  };
  
  const addSale = async (sale: Omit<Sale, 'id'>) => {
    return await FirebaseService.addSale(sale, userId);
  };
  
  const updateSale = async (id: string, sale: Partial<Sale>) => {
    await FirebaseService.updateSale(id, sale, userId);
  };
  
  const deleteSale = async (id: string) => {
    await FirebaseService.deleteSale(id, userId);
  };
  
  const addStockMovement = async (stockMovement: Omit<StockMovement, 'id'>) => {
    return await FirebaseService.addStockMovement(stockMovement, userId);
  };

  return (
    <AppContext.Provider value={{
      products,
      suppliers,
      customers,
      purchases,
      sales,
      stockMovements,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addPurchase,
      updatePurchase,
      deletePurchase,
      addSale,
      updateSale,
      deleteSale,
      addStockMovement
    }}>
      {children}
    </AppContext.Provider>
  );
};

import { isElectron, saveData, loadData } from '../services/electronBridge';