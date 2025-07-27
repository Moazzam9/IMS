import { database } from '../config/firebase';
import { ref, push, set, get, remove, onValue, off, update } from 'firebase/database';
import { Product, Supplier, Customer, Purchase, Sale, User, StockMovement } from '../types';

// Generic Firebase service functions
export class FirebaseService {
  // Products
  static async addProduct(product: Omit<Product, 'id'>, userId: string): Promise<string> {
    const productsRef = ref(database, `users/${userId}/products`);
    const newProductRef = push(productsRef);
    await set(newProductRef, {
      ...product,
      createdAt: new Date().toISOString()
    });
    return newProductRef.key!;
  }

  static async updateProduct(id: string, product: Partial<Product>, userId: string): Promise<void> {
    const productRef = ref(database, `users/${userId}/products/${id}`);
    await update(productRef, product);
  }

  static async deleteProduct(id: string, userId: string): Promise<void> {
    const productRef = ref(database, `users/${userId}/products/${id}`);
    await remove(productRef);
  }

  static subscribeToProducts(callback: (products: Product[]) => void, userId: string): () => void {
    const productsRef = ref(database, `users/${userId}/products`);
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const products: Product[] = data 
        ? Object.entries(data).map(([id, product]) => ({ 
            id, 
            ...(product as Omit<Product, 'id'>) 
          }))
        : [];
      callback(products);
    });
    
    return () => off(productsRef, 'value', unsubscribe);
  }

  // Suppliers
  static async addSupplier(supplier: Omit<Supplier, 'id'>, userId: string): Promise<string> {
    const suppliersRef = ref(database, `users/${userId}/suppliers`);
    const newSupplierRef = push(suppliersRef);
    await set(newSupplierRef, {
      ...supplier,
      balance: 0,
      createdAt: new Date().toISOString()
    });
    return newSupplierRef.key!;
  }

  static async updateSupplier(id: string, supplier: Partial<Supplier>, userId: string): Promise<void> {
    const supplierRef = ref(database, `users/${userId}/suppliers/${id}`);
    await update(supplierRef, supplier);
  }

  static async deleteSupplier(id: string, userId: string): Promise<void> {
    const supplierRef = ref(database, `users/${userId}/suppliers/${id}`);
    await remove(supplierRef);
  }

  static subscribeToSuppliers(callback: (suppliers: Supplier[]) => void, userId: string): () => void {
    const suppliersRef = ref(database, `users/${userId}/suppliers`);
    const unsubscribe = onValue(suppliersRef, (snapshot) => {
      const data = snapshot.val();
      const suppliers: Supplier[] = data 
        ? Object.entries(data).map(([id, supplier]) => ({ 
            id, 
            ...(supplier as Omit<Supplier, 'id'>) 
          }))
        : [];
      callback(suppliers);
    });
    
    return () => off(suppliersRef, 'value', unsubscribe);
  }

  // Customers
  static async addCustomer(customer: Omit<Customer, 'id'>, userId: string): Promise<string> {
    const customersRef = ref(database, `users/${userId}/customers`);
    const newCustomerRef = push(customersRef);
    await set(newCustomerRef, {
      ...customer,
      balance: 0,
      createdAt: new Date().toISOString()
    });
    return newCustomerRef.key!;
  }

  static async updateCustomer(id: string, customer: Partial<Customer>, userId: string): Promise<void> {
    const customerRef = ref(database, `users/${userId}/customers/${id}`);
    await update(customerRef, customer);
  }

  static async deleteCustomer(id: string, userId: string): Promise<void> {
    const customerRef = ref(database, `users/${userId}/customers/${id}`);
    await remove(customerRef);
  }

  static subscribeToCustomers(callback: (customers: Customer[]) => void, userId: string): () => void {
    const customersRef = ref(database, `users/${userId}/customers`);
    const unsubscribe = onValue(customersRef, (snapshot) => {
      const data = snapshot.val();
      const customers: Customer[] = data 
        ? Object.entries(data).map(([id, customer]) => ({ 
            id, 
            ...(customer as Omit<Customer, 'id'>) 
          }))
        : [];
      callback(customers);
    });
    
    return () => off(customersRef, 'value', unsubscribe);
  }

  // Purchases
  static async addPurchase(purchase: Omit<Purchase, 'id'>, userId: string): Promise<string> {
    const purchasesRef = ref(database, `users/${userId}/purchases`);
    const newPurchaseRef = push(purchasesRef);
    await set(newPurchaseRef, {
      ...purchase,
      createdAt: new Date().toISOString()
    });
    return newPurchaseRef.key!;
  }

  static async updatePurchase(id: string, purchase: Partial<Purchase>, userId: string): Promise<void> {
    const purchaseRef = ref(database, `users/${userId}/purchases/${id}`);
    await update(purchaseRef, purchase);
  }

  static async deletePurchase(id: string, userId: string): Promise<void> {
    const purchaseRef = ref(database, `users/${userId}/purchases/${id}`);
    await remove(purchaseRef);
  }

  static subscribeToPurchases(callback: (purchases: Purchase[]) => void, userId: string): () => void {
    const purchasesRef = ref(database, `users/${userId}/purchases`);
    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      const purchases: Purchase[] = data 
        ? Object.entries(data).map(([id, purchase]) => ({ 
            id, 
            ...(purchase as Omit<Purchase, 'id'>) 
          }))
        : [];
      callback(purchases);
    });
    
    return () => off(purchasesRef, 'value', unsubscribe);
  }

  // Sales
  static async addSale(sale: Omit<Sale, 'id'>, userId: string): Promise<string> {
    const salesRef = ref(database, `users/${userId}/sales`);
    const newSaleRef = push(salesRef);
    await set(newSaleRef, {
      ...sale,
      createdAt: new Date().toISOString()
    });
    return newSaleRef.key!;
  }

  static async updateSale(id: string, sale: Partial<Sale>, userId: string): Promise<void> {
    const saleRef = ref(database, `users/${userId}/sales/${id}`);
    await update(saleRef, sale);
  }

  static async deleteSale(id: string, userId: string): Promise<void> {
    const saleRef = ref(database, `users/${userId}/sales/${id}`);
    await remove(saleRef);
  }

  static subscribeToSales(callback: (sales: Sale[]) => void, userId: string): () => void {
    const salesRef = ref(database, `users/${userId}/sales`);
    const unsubscribe = onValue(salesRef, (snapshot) => {
      const data = snapshot.val();
      const sales: Sale[] = data 
        ? Object.entries(data).map(([id, sale]) => ({ 
            id, 
            ...(sale as Omit<Sale, 'id'>) 
          }))
        : [];
      callback(sales);
    });
    
    return () => off(salesRef, 'value', unsubscribe);
  }

  // Users
  static async addUser(user: Omit<User, 'id'>): Promise<string> {
    // First create a user entry in the users collection
    const usersRef = ref(database, 'users');
    const newUserRef = push(usersRef);
    const userId = newUserRef.key!;
    
    // Set the user data
    await set(newUserRef, {
      ...user,
      createdAt: new Date().toISOString()
    });
    
    // Create a user-specific folder structure for their data
    const userDataRef = ref(database, `users/${userId}/profile`);
    await set(userDataRef, {
      initialized: true,
      createdAt: new Date().toISOString()
    });
    
    return userId;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    const data = snapshot.val();
    
    console.log('Checking for username:', username);
    
    if (!data) {
      console.log('No users found in database');
      return null;
    }
    
    console.log('Found users:', Object.keys(data).length);
    console.log('Available usernames:', Object.values(data).map((user: any) => user.username).join(', '));
    
    const userEntry = Object.entries(data).find(([_, user]: [string, any]) => 
      user.username === username
    );
    
    if (!userEntry) {
      console.log('Username not found');
      return null;
    }
    
    console.log('Username found');
    const [id, userData] = userEntry;
    return { id, ...(userData as Omit<User, 'id'>) };
  }

  static async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    const data = snapshot.val();
    
    console.log('Checking for firebaseUid:', firebaseUid);
    
    if (!data) {
      console.log('No users found in database');
      return null;
    }
    
    console.log('Found users:', Object.keys(data).length);
    
    const userEntry = Object.entries(data).find(([_, user]: [string, any]) => 
      user.firebaseUid === firebaseUid
    );
    
    if (!userEntry) {
      console.log('User with firebaseUid not found');
      return null;
    }
    
    console.log('User found by firebaseUid');
    const [id, userData] = userEntry;
    return { id, ...(userData as Omit<User, 'id'>) };
  }

  // Stock Movements
  static async addStockMovement(stockMovement: Omit<StockMovement, 'id'>, userId: string): Promise<string> {
    const stockMovementsRef = ref(database, `users/${userId}/stockMovements`);
    const newStockMovementRef = push(stockMovementsRef);
    await set(newStockMovementRef, {
      ...stockMovement,
      createdAt: new Date().toISOString()
    });
    return newStockMovementRef.key!;
  }
  
  // Settings
  static async saveSettings(settingsType: string, settings: any, userId: string): Promise<void> {
    const settingsRef = ref(database, `users/${userId}/settings/${settingsType}`);
    await set(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    });
  }
  
  static async getSettings(settingsType: string, userId: string): Promise<any> {
    const settingsRef = ref(database, `users/${userId}/settings/${settingsType}`);
    const snapshot = await get(settingsRef);
    return snapshot.val();
  }

  static subscribeToStockMovements(callback: (stockMovements: StockMovement[]) => void, userId: string): () => void {
    const stockMovementsRef = ref(database, `users/${userId}/stockMovements`);
    const unsubscribe = onValue(stockMovementsRef, (snapshot) => {
      const data = snapshot.val();
      const stockMovements: StockMovement[] = data 
        ? Object.entries(data).map(([id, stockMovement]) => ({ 
            id, 
            ...(stockMovement as Omit<StockMovement, 'id'>) 
          }))
        : [];
      callback(stockMovements);
    });
    
    return () => off(stockMovementsRef, 'value', unsubscribe);
  }
}