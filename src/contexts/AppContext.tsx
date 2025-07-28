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
        // Subscribe to real-time updates with user ID and sort by newest first
        unsubscribeProducts = FirebaseService.subscribeToProducts((products) => {
          // Sort products by createdAt date (newest first)
          const sortedProducts = [...products].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setProducts(sortedProducts);
        }, userId);
        
        unsubscribeSuppliers = FirebaseService.subscribeToSuppliers((suppliers) => {
          // Sort suppliers by createdAt date (newest first)
          const sortedSuppliers = [...suppliers].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setSuppliers(sortedSuppliers);
        }, userId);
        
        unsubscribeCustomers = FirebaseService.subscribeToCustomers((customers) => {
          // Sort customers by createdAt date (newest first)
          const sortedCustomers = [...customers].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setCustomers(sortedCustomers);
        }, userId);
        
        unsubscribePurchases = FirebaseService.subscribeToPurchases((purchases) => {
          // Sort purchases by createdAt date (newest first)
          const sortedPurchases = [...purchases].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPurchases(sortedPurchases);
        }, userId);
        
        unsubscribeSales = FirebaseService.subscribeToSales((sales) => {
          // Sort sales by createdAt date (newest first)
          const sortedSales = [...sales].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setSales(sortedSales);
        }, userId);
        
        unsubscribeStockMovements = FirebaseService.subscribeToStockMovements((movements) => {
          // Sort stock movements by createdAt date (newest first)
          const sortedMovements = [...movements].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setStockMovements(sortedMovements);
        }, userId);
        
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
    // Add the sale to the database
    const saleId = await FirebaseService.addSale(sale, userId);
    
    // Update product stock and create stock movements for each item
    if (sale.status === 'completed') {
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          // Deduct the quantity from product stock
          const newStock = Math.max(0, product.currentStock - item.quantity);
          await updateProduct(product.id, { currentStock: newStock });
          
          // Create stock movement record
          const stockMovement: Omit<StockMovement, 'id'> = {
            productId: product.id,
            type: 'sale',
            quantity: item.quantity,
            referenceId: saleId,
            referenceType: 'sale',
            date: sale.saleDate,
            createdAt: new Date().toISOString()
          };
          
          await addStockMovement(stockMovement);
        }
      }
    }
    
    return saleId;
  };
  
  const updateSale = async (id: string, sale: Partial<Sale>) => {
    // Get the original sale to compare changes
    const originalSale = sales.find(s => s.id === id);
    
    // Update the sale in the database
    await FirebaseService.updateSale(id, sale, userId);
    
    // Handle stock updates if status is completed and items are provided
    if (sale.status === 'completed' && sale.items && originalSale) {
      // For each item in the updated sale
      for (const newItem of sale.items) {
        // Find the original item to compare quantities
        const originalItem = originalSale.items.find(item => item.productId === newItem.productId);
        const product = products.find(p => p.id === newItem.productId);
        
        if (product) {
          let quantityDifference = 0;
          
          if (originalItem) {
            // If item existed before, calculate the difference
            quantityDifference = newItem.quantity - originalItem.quantity;
          } else {
            // If it's a new item, the difference is the full quantity
            quantityDifference = newItem.quantity;
          }
          
          // Only update stock if there's a change in quantity
          if (quantityDifference !== 0) {
            // Update product stock
            const newStock = Math.max(0, product.currentStock - quantityDifference);
            await updateProduct(product.id, { currentStock: newStock });
            
            // Create stock movement record for the difference
            const stockMovement: Omit<StockMovement, 'id'> = {
              productId: product.id,
              type: quantityDifference > 0 ? 'sale' : 'return_sale',
              quantity: Math.abs(quantityDifference),
              referenceId: id,
              referenceType: 'sale_update',
              date: sale.saleDate || originalSale.saleDate,
              createdAt: new Date().toISOString()
            };
            
            await addStockMovement(stockMovement);
          }
        }
      }
      
      // Check for items that were removed from the sale
      for (const originalItem of originalSale.items) {
        const stillExists = sale.items.some(item => item.productId === originalItem.productId);
        
        if (!stillExists) {
          // Item was removed, return the quantity to stock
          const product = products.find(p => p.id === originalItem.productId);
          if (product) {
            const newStock = product.currentStock + originalItem.quantity;
            await updateProduct(product.id, { currentStock: newStock });
            
            // Create stock movement record for the returned quantity
            const stockMovement: Omit<StockMovement, 'id'> = {
              productId: product.id,
              type: 'return_sale',
              quantity: originalItem.quantity,
              referenceId: id,
              referenceType: 'sale_update',
              date: sale.saleDate || originalSale.saleDate,
              createdAt: new Date().toISOString()
            };
            
            await addStockMovement(stockMovement);
          }
        }
      }
    }
  };
  
  const deleteSale = async (id: string) => {
    // Get the sale before deleting it
    const saleToDelete = sales.find(s => s.id === id);
    
    // Delete the sale from the database
    await FirebaseService.deleteSale(id, userId);
    
    // If the sale was completed, return the quantities to stock
    if (saleToDelete && saleToDelete.status === 'completed') {
      for (const item of saleToDelete.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          // Return the quantity to stock
          const newStock = product.currentStock + item.quantity;
          await updateProduct(product.id, { currentStock: newStock });
          
          // Create stock movement record for the returned quantity
          const stockMovement: Omit<StockMovement, 'id'> = {
            productId: product.id,
            type: 'return_sale',
            quantity: item.quantity,
            referenceId: id,
            referenceType: 'sale_delete',
            date: saleToDelete.saleDate,
            createdAt: new Date().toISOString()
          };
          
          await addStockMovement(stockMovement);
        }
      }
    }
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