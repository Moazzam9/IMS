import { FirebaseService } from './firebase';
import { OldBattery } from '../types';
import { database } from '../config/firebase';
import { ref, push, set, update, get, remove } from 'firebase/database';

export class OldBatteryService {
  private static collectionName = 'oldBatteries';

  static async addOldBattery(oldBattery: Omit<OldBattery, 'id'>, userId: string): Promise<string> {
    try {
      // Validate required fields
      if (!oldBattery.saleId || !oldBattery.saleItemId) {
        throw new Error('Old battery must be associated with a sale and sale item');
      }
      if (!oldBattery.name || !oldBattery.weight || !oldBattery.ratePerKg || typeof oldBattery.deductionAmount !== 'number') {
        throw new Error('Invalid old battery data: missing required fields');
      }

      const oldBatteriesRef = ref(database, `users/${userId}/oldBatteries`);
      const newOldBatteryRef = push(oldBatteriesRef);
      const oldBatteryId = newOldBatteryRef.key!;
      const timestamp = new Date().toISOString();

      const oldBatteryData = {
        id: oldBatteryId,
        saleId: oldBattery.saleId,
        saleItemId: oldBattery.saleItemId,
        name: oldBattery.name,
        weight: oldBattery.weight,
        ratePerKg: oldBattery.ratePerKg,
        deductionAmount: oldBattery.deductionAmount,
        createdAt: timestamp
      };

      await set(newOldBatteryRef, oldBatteryData);

      return oldBatteryId;
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

  static async getOldBatteriesBySaleId(saleId: string, userId: string): Promise<OldBattery[]> {
    try {
      const oldBatteriesRef = ref(database, `users/${userId}/oldBatteries`);
      const snapshot = await get(oldBatteriesRef);
      const oldBatteries: OldBattery[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const oldBattery = childSnapshot.val();
          if (oldBattery.saleId === saleId) {
            oldBatteries.push({
              ...oldBattery,
              id: childSnapshot.key
            });
          }
        });
      }

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
}