import { database } from '../config/firebase';
import { ref, push, set, update, remove, onValue, off, get } from 'firebase/database';
import { Product, Supplier, Customer, Purchase, Sale, User, SaleItem } from '../types';
import { OldBatteryService } from './oldBatteryService';

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
    try {
      console.log('FirebaseService.addSale called with:', sale);
      if (!Array.isArray(sale.items) || sale.items.length === 0) {
        throw new Error('Sale must include at least one item');
      }

      const salesRef = ref(database, `users/${userId}/sales`);
      const newSaleRef = push(salesRef);
      const saleId = newSaleRef.key!;

      const timestamp = new Date().toISOString();

      // Create the sale record without items array to avoid duplication
      const { items, ...saleData } = sale;
      console.log('Saving sale record:', { ...saleData, id: saleId, createdAt: timestamp });
      await set(newSaleRef, {
        ...saleData,
        id: saleId,
        createdAt: timestamp
      });

      // Create sale items records
      const saleItemsRef = ref(database, `users/${userId}/saleItems/${saleId}`);

      try {
        // First save all sale items
        console.log('Saving sale items:', items);
        const savedItems = await Promise.all(items.map(async (item) => {
          const newItemRef = push(saleItemsRef);
          const itemId = newItemRef.key!;

          // Validate required fields
          if (!item.productId || !item.quantity || !item.salePrice || typeof item.total !== 'number') {
            throw new Error('Invalid sale item data');
          }

          // Prepare sale item data
          const itemData = {
            id: itemId,
            saleId,
            productId: item.productId,
            quantity: item.quantity,
            salePrice: item.salePrice,
            discount: item.discount || 0,
            total: item.total,
            includeOldBattery: !!item.oldBatteryData,
            createdAt: timestamp
          };

          console.log('Saving sale item:', itemData);
          await set(newItemRef, itemData);
          return { itemId, item };
        }));

        // Then save all old battery data
        if (savedItems.some(({ item }) => item.oldBatteryData)) {
          console.log('Saving old battery data for items:', savedItems.filter(({ item }) => item.oldBatteryData));
          const oldBatteryPromises = savedItems
            .filter(({ item }) => item.oldBatteryData)
            .map(async ({ itemId, item }) => {
              if (!item.oldBatteryData?.name || !item.oldBatteryData?.weight ||
                !item.oldBatteryData?.ratePerKg || typeof item.oldBatteryData?.deductionAmount !== 'number') {
                throw new Error('Invalid old battery data');
              }

              const oldBatteryData = {
                name: item.oldBatteryData.name,
                weight: item.oldBatteryData.weight,
                ratePerKg: item.oldBatteryData.ratePerKg,
                deductionAmount: item.oldBatteryData.deductionAmount,
                saleId,
                saleItemId: itemId
              };
              console.log('Saving old battery data:', oldBatteryData);
              await OldBatteryService.addOldBattery(oldBatteryData, userId);
            });

          await Promise.all(oldBatteryPromises);
        }

        console.log('Sale saved successfully with ID:', saleId);
        return saleId;
      } catch (error) {
        console.error('Error saving sale items or old batteries:', error);
        // Delete the sale if saving items fails
        await remove(ref(database, `users/${userId}/sales/${saleId}`));
        throw new Error('Failed to save sale items or old batteries');
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      throw new Error('Failed to add sale to database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  static async updateSale(id: string, sale: Partial<Sale>, userId: string): Promise<void> {
    const saleRef = ref(database, `users/${userId}/sales/${id}`);
    await update(saleRef, sale);
  }

  static async deleteSale(id: string, userId: string): Promise<void> {
    const saleRef = ref(database, `users/${userId}/sales/${id}`);
    await remove(saleRef);
  }

  static async getSaleItems(saleId: string, userId: string): Promise<SaleItem[]> {
    try {
      const saleItemsRef = ref(database, `users/${userId}/saleItems/${saleId}`);
      const snapshot = await get(saleItemsRef);
      const data = snapshot.val();

      const items: SaleItem[] = data
        ? Object.entries(data).map(([itemId, item]) => ({
          id: itemId,
          ...(item as Omit<SaleItem, 'id'>)
        }))
        : [];

      // Load old battery data for each item that has includeOldBattery = true
      const itemsWithOldBattery = await Promise.all(items.map(async (item) => {
        if (item.includeOldBattery) {
          try {
            const oldBatteries = await OldBatteryService.getOldBatteriesBySaleId(saleId, userId);
            const oldBattery = oldBatteries.find(battery => battery.saleItemId === item.id);

            if (oldBattery) {
              return {
                ...item,
                oldBatteryData: {
                  name: oldBattery.name,
                  weight: oldBattery.weight,
                  ratePerKg: oldBattery.ratePerKg,
                  deductionAmount: oldBattery.deductionAmount
                }
              };
            }
          } catch (error) {
            console.error(`Error loading old battery for item ${item.id}:`, error);
          }
        }

        return item;
      }));

      console.log('Loaded sale items with old battery data:', itemsWithOldBattery);
      return itemsWithOldBattery;
    } catch (error) {
      console.error(`Error loading items for sale ${saleId}:`, error);
      return [];
    }
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

      // First, call the callback with basic sales data for immediate UI update
      callback(sales);

      // Then, load items asynchronously and update again
      if (sales.length > 0) {
        Promise.all(sales.map(async (sale) => {
          try {
            const saleItemsRef = ref(database, `users/${userId}/saleItems/${sale.id}`);
            const itemsSnapshot = await get(saleItemsRef);
            const itemsData = itemsSnapshot.val();

            const items: SaleItem[] = itemsData
              ? Object.entries(itemsData).map(([itemId, item]) => ({
                id: itemId,
                ...(item as Omit<SaleItem, 'id'>)
              }))
              : [];

            // Load old battery data for each item that has includeOldBattery = true
            const itemsWithOldBattery = await Promise.all(items.map(async (item) => {
              if (item.includeOldBattery) {
                try {
                  const oldBatteries = await OldBatteryService.getOldBatteriesBySaleId(sale.id, userId);
                  const oldBattery = oldBatteries.find(battery => battery.saleItemId === item.id);

                  if (oldBattery) {
                    return {
                      ...item,
                      oldBatteryData: {
                        name: oldBattery.name,
                        weight: oldBattery.weight,
                        ratePerKg: oldBattery.ratePerKg,
                        deductionAmount: oldBattery.deductionAmount
                      }
                    };
                  }
                } catch (error) {
                  console.error(`Error loading old battery for item ${item.id}:`, error);
                }
              }

              return item;
            }));

            return {
              ...sale,
              items: itemsWithOldBattery
            };
          } catch (error) {
            console.error(`Error loading items for sale ${sale.id}:`, error);
            return {
              ...sale,
              items: []
            };
          }
        })).then((salesWithItems) => {
          // Update the callback with complete sales data including items
          callback(salesWithItems);
        }).catch((error) => {
          console.error('Error loading sales with items:', error);
          // Keep the basic sales data if items loading fails
          callback(sales);
        });
      }
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