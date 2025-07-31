import { FirebaseService } from './firebase';
import { OldBattery } from '../types';
import { database } from '../config/firebase';
import { ref, push, set, update, get, remove } from 'firebase/database';

export class OldBatteryService {
  private static collectionName = 'oldBatteries';

  static async addOldBattery(batteryData: any, userId: string): Promise<string> {
    try {
      // Check if this is a standalone old battery sale or part of a regular sale
      const isStandaloneSale = batteryData.invoiceNumber !== undefined;
      
      if (isStandaloneSale) {
        // This is a standalone old battery sale with invoice details
        if (!batteryData.name || !batteryData.weight || !batteryData.ratePerKg || 
            typeof batteryData.deductionAmount !== 'number' || !batteryData.invoiceNumber) {
          throw new Error('Invalid old battery sale data: missing required fields');
        }
        
        // Add to oldBatterySales collection
        const oldBatterySalesRef = ref(database, `users/${userId}/oldBatterySales`);
        const newOldBatterySaleRef = push(oldBatterySalesRef);
        const oldBatterySaleId = newOldBatterySaleRef.key!;
        const timestamp = new Date().toISOString();
        
        const saleData = {
          id: oldBatterySaleId,
          invoiceNumber: batteryData.invoiceNumber,
          customerId: batteryData.customerId || '',
          customerName: batteryData.customerName || '',
          salesperson: batteryData.salesperson || '',
          saleDate: batteryData.saleDate || timestamp,
          status: batteryData.status || 'completed',
          amountPaid: batteryData.amountPaid || 0,
          totalAmount: batteryData.deductionAmount,
          discount: batteryData.discount || 0,
          remainingBalance: batteryData.remainingBalance || 0,
          oldBatteryDetails: {
            name: batteryData.name,
            weight: batteryData.weight,
            ratePerKg: batteryData.ratePerKg,
            deductionAmount: batteryData.deductionAmount,
            quantity: batteryData.quantity || 1
          },
          createdAt: timestamp
        };
        
        await set(newOldBatterySaleRef, saleData);
        return oldBatterySaleId;
      } else {
        // This is an old battery as part of a regular sale
        if (!batteryData.saleId || !batteryData.saleItemId) {
          throw new Error('Old battery must be associated with a sale and sale item');
        }
        if (!batteryData.name || !batteryData.weight || !batteryData.ratePerKg || 
            typeof batteryData.deductionAmount !== 'number') {
          throw new Error('Invalid old battery data: missing required fields');
        }

        const oldBatteriesRef = ref(database, `users/${userId}/oldBatteries`);
        const newOldBatteryRef = push(oldBatteriesRef);
        const oldBatteryId = newOldBatteryRef.key!;
        const timestamp = new Date().toISOString();

        const oldBatteryData = {
          id: oldBatteryId,
          saleId: batteryData.saleId,
          saleItemId: batteryData.saleItemId,
          name: batteryData.name,
          weight: batteryData.weight,
          ratePerKg: batteryData.ratePerKg,
          deductionAmount: batteryData.deductionAmount,
          quantity: batteryData.quantity || 1,
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
      // Get all old batteries and sales
      const oldBatteries = await this.getOldBatteries(userId);
      const oldBatterySales = await this.getOldBatterySales(userId);
      
      // Group batteries by name and aggregate their data
      const stockMap = new Map<string, OldBattery>();
      
      // First add all batteries to the stock
      oldBatteries.forEach(battery => {
        const key = battery.name.toLowerCase();
        const quantity = battery.quantity || 1;
        const weight = battery.weight || 0;
        // For manually added batteries, the weight is already the unit weight
        // No need to divide by quantity
        const unitWeight = weight;
        
        if (stockMap.has(key)) {
          // Update existing entry
          const existing = stockMap.get(key)!;
          const newQuantity = (existing.quantity || 1) + quantity;
          const newWeight = existing.weight + weight;
          
          stockMap.set(key, {
            ...existing,
            weight: newWeight,
            // Average the rate per kg
            ratePerKg: (existing.ratePerKg + battery.ratePerKg) / 2,
            deductionAmount: existing.deductionAmount + battery.deductionAmount,
            quantity: newQuantity,
            // Preserve the original unit weight if it exists, otherwise use the weight directly
            originalUnitWeight: existing.originalUnitWeight || unitWeight
          });
        } else {
          // Add new entry with original unit weight
          stockMap.set(key, { 
            ...battery,
            originalUnitWeight: unitWeight
          });
        }
      });
      
      // Get all old batteries from sales collection (these are the ones that have been sold)
      const soldBatteries = [];
      
      // Process all sales to extract sold batteries
      oldBatterySales.forEach(sale => {
        if (sale.oldBatteryDetails) {
          soldBatteries.push({
            name: sale.oldBatteryDetails.name,
            weight: sale.oldBatteryDetails.weight || 0,
            quantity: sale.oldBatteryDetails.quantity || 1
          });
        }
      });
      
      console.log('Sold batteries:', soldBatteries);
      
      // Group sold batteries by name
      const soldBatteriesMap = new Map();
      soldBatteries.forEach(battery => {
        const key = battery.name.toLowerCase();
        
        if (soldBatteriesMap.has(key)) {
          const existing = soldBatteriesMap.get(key);
          soldBatteriesMap.set(key, {
            name: battery.name,
            weight: existing.weight + battery.weight,
            quantity: existing.quantity + battery.quantity
          });
        } else {
          soldBatteriesMap.set(key, {
            name: battery.name,
            weight: battery.weight,
            quantity: battery.quantity
          });
        }
      });
      
      console.log('Grouped sold batteries:', Array.from(soldBatteriesMap.values()));
      
      // Deduct sold batteries from stock
      soldBatteriesMap.forEach((soldBattery, key) => {
        if (stockMap.has(key)) {
          const existing = stockMap.get(key)!;
          const newQuantity = Math.max(0, (existing.quantity || 1) - soldBattery.quantity);
          const newWeight = Math.max(0, existing.weight - soldBattery.weight);
          
          console.log(`Deducting ${soldBattery.quantity} of ${key} from stock. Before: ${existing.quantity}, After: ${newQuantity}`);
          
          // Preserve the existing originalUnitWeight instead of recalculating
          
          stockMap.set(key, {
            ...existing,
            weight: newWeight,
            quantity: newQuantity,
            // Keep the original unit weight as is
            originalUnitWeight: existing.originalUnitWeight
          });
        }
      });
      
      console.log('Final stock after deductions:', Array.from(stockMap.entries()).map(([key, value]) => ({ name: key, quantity: value.quantity })));
      
      
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