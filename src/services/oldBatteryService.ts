import { FirebaseService } from './firebase';
import { OldBattery } from '../types';
import { database } from '../config/firebase';
import { ref, push, set, update, get, remove } from 'firebase/database';

export class OldBatteryService {
  private static collectionName = 'oldBatteries';

  static async addOldBattery(oldBatteryData: any, userId: string): Promise<string> {
    try {
      // Check if this is a standalone old battery sale or part of a regular sale
      const isStandaloneSale = oldBatteryData.invoiceNumber !== undefined;
      
      if (isStandaloneSale) {
        // This is a standalone old battery sale with invoice details
        if (!oldBatteryData.name || !oldBatteryData.weight || !oldBatteryData.ratePerKg || 
            typeof oldBatteryData.deductionAmount !== 'number' || !oldBatteryData.invoiceNumber) {
          throw new Error('Invalid old battery sale data: missing required fields');
        }
        
        // Add to oldBatterySales collection
        const oldBatterySalesRef = ref(database, `users/${userId}/oldBatterySales`);
        const newOldBatterySaleRef = push(oldBatterySalesRef);
        const oldBatterySaleId = newOldBatterySaleRef.key!;
        const timestamp = new Date().toISOString();
        
        const saleData = {
          id: oldBatterySaleId,
          invoiceNumber: oldBatteryData.invoiceNumber,
          customerId: oldBatteryData.customerId || '',
          customerName: oldBatteryData.customerName || '',
          salesperson: oldBatteryData.salesperson || '',
          saleDate: oldBatteryData.saleDate || timestamp,
          status: oldBatteryData.status || 'completed',
          amountPaid: oldBatteryData.amountPaid || 0,
          totalAmount: oldBatteryData.deductionAmount,
          discount: oldBatteryData.discount || 0,
          remainingBalance: oldBatteryData.remainingBalance || 0,
          oldBatteryDetails: {
            name: oldBatteryData.name,
            weight: oldBatteryData.weight,
            ratePerKg: oldBatteryData.ratePerKg,
            deductionAmount: oldBatteryData.deductionAmount
          },
          createdAt: timestamp
        };
        
        await set(newOldBatterySaleRef, saleData);
        return oldBatterySaleId;
      } else {
        // This is an old battery as part of a regular sale
        if (!oldBatteryData.saleId || !oldBatteryData.saleItemId) {
          throw new Error('Old battery must be associated with a sale and sale item');
        }
        if (!oldBatteryData.name || !oldBatteryData.weight || !oldBatteryData.ratePerKg || 
            typeof oldBatteryData.deductionAmount !== 'number') {
          throw new Error('Invalid old battery data: missing required fields');
        }

        const oldBatteriesRef = ref(database, `users/${userId}/oldBatteries`);
        const newOldBatteryRef = push(oldBatteriesRef);
        const oldBatteryId = newOldBatteryRef.key!;
        const timestamp = new Date().toISOString();

        const oldBatteryData = {
          id: oldBatteryId,
          saleId: oldBatteryData.saleId,
          saleItemId: oldBatteryData.saleItemId,
          name: oldBatteryData.name,
          weight: oldBatteryData.weight,
          ratePerKg: oldBatteryData.ratePerKg,
          deductionAmount: oldBatteryData.deductionAmount,
          createdAt: timestamp
        };

        await set(newOldBatteryRef, oldBatteryData);
        return oldBatteryId;
      }
    } catch (error) {
      console.error('Error adding old battery:', error);
      throw new Error('Failed to add old battery to database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  static async getOldBatteries(userId: string): Promise<OldBattery[]> {
    try {
      const oldBatteriesRef = ref(database, `users/${userId}/oldBatteries`);
      const snapshot = await get(oldBatteriesRef);
      const data = snapshot.val();
      return data ? Object.entries(data).map(([id, battery]) => ({
        id,
        ...(battery as Omit<OldBattery, 'id'>)
      })) : [];
    } catch (error) {
      console.error('Error getting old batteries:', error);
      throw error;
    }
  }
  
  static async getOldBatteryStock(userId: string): Promise<OldBattery[]> {
    try {
      // Get all old batteries
      const oldBatteries = await this.getOldBatteries(userId);
      
      // Group batteries by name and aggregate their data
      const stockMap = new Map<string, OldBattery>();
      
      oldBatteries.forEach(battery => {
        const key = battery.name.toLowerCase();
        
        if (stockMap.has(key)) {
          // Update existing entry
          const existing = stockMap.get(key)!;
          stockMap.set(key, {
            ...existing,
            weight: existing.weight + battery.weight,
            // Average the rate per kg
            ratePerKg: (existing.ratePerKg + battery.ratePerKg) / 2,
            deductionAmount: existing.deductionAmount + battery.deductionAmount
          });
        } else {
          // Add new entry
          stockMap.set(key, { ...battery });
        }
      });
      
      // Convert map to array
      return Array.from(stockMap.values());
    } catch (error) {
      console.error('Error getting old battery stock:', error);
      throw error;
    }
  }

  static async getOldBatterySales(userId: string): Promise<any[]> {
    try {
      const oldBatterySalesRef = ref(database, `users/${userId}/oldBatterySales`);
      const snapshot = await get(oldBatterySalesRef);
      const data = snapshot.val();
      return data ? Object.entries(data).map(([id, sale]) => ({
        id,
        ...(sale as any)
      })) : [];
    } catch (error) {
      console.error('Error getting old battery sales:', error);
      throw error;
    }
  }

  static async getOldBatteriesBySaleId(saleId: string, userId: string): Promise<OldBattery[]> {
    try {
      const oldBatteriesRef = ref(database, `users/${userId}/oldBatteries`);
      const snapshot = await get(oldBatteriesRef);
      const data = snapshot.val();
      
      const oldBatteries: OldBattery[] = data 
        ? Object.entries(data)
            .filter(([_, oldBattery]) => (oldBattery as any).saleId === saleId)
            .map(([id, oldBattery]) => ({ 
              id, 
              ...(oldBattery as Omit<OldBattery, 'id'>) 
            }))
        : [];
      
      console.log(`Found ${oldBatteries.length} old batteries for sale ${saleId}:`, oldBatteries);
      return oldBatteries;
    } catch (error) {
      console.error('Error getting old batteries by sale ID:', error);
      throw new Error('Failed to get old batteries from database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  static async updateOldBattery(id: string, data: Partial<OldBattery>, userId: string): Promise<void> {
    try {
      const oldBatteryRef = ref(database, `users/${userId}/oldBatteries/${id}`);
      await update(oldBatteryRef, data);
    } catch (error) {
      console.error('Error updating old battery:', error);
      throw error;
    }
  }

  static async deleteOldBattery(id: string, userId: string): Promise<void> {
    try {
      const oldBatteryRef = ref(database, `users/${userId}/oldBatteries/${id}`);
      await remove(oldBatteryRef);
    } catch (error) {
      console.error('Error deleting old battery:', error);
      throw new Error('Failed to delete old battery from database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  static async updateOldBatterySale(id: string, data: any, userId: string): Promise<void> {
    try {
      const oldBatterySaleRef = ref(database, `users/${userId}/oldBatterySales/${id}`);
      await update(oldBatterySaleRef, data);
    } catch (error) {
      console.error('Error updating old battery sale:', error);
      throw new Error('Failed to update old battery sale in database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  static async deleteOldBatterySale(id: string, userId: string): Promise<void> {
    try {
      const oldBatterySaleRef = ref(database, `users/${userId}/oldBatterySales/${id}`);
      await remove(oldBatterySaleRef);
    } catch (error) {
      console.error('Error deleting old battery sale:', error);
      throw new Error('Failed to delete old battery sale from database: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}