import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { database } from '../../config/firebase';
import { ref, remove, get, set } from 'firebase/database';

interface ResetButtonProps {
  section: 'sales' | 'oldBatterySales' | 'purchases' | 'stock' | 'reports';
  onReset?: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ section, onReset }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!user?.firebaseUid) {
      showToast('You must be logged in to reset data', 'error');
      return;
    }

    const confirmMessage = `Are you sure you want to reset all ${section} data? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsResetting(true);
    try {
      const userId = user.firebaseUid;
      
      // Special handling for oldBatterySales to prevent re-adding quantities back to stock
      if (section === 'oldBatterySales') {
        // Before deleting oldBatterySales, we need to create a backup of the sold quantities
        // to prevent them from being re-added to stock
        const oldBatterySalesRef = ref(database, `users/${userId}/oldBatterySales`);
        const oldBatterySalesBackupRef = ref(database, `users/${userId}/oldBatterySalesBackup`);
        
        // Copy current oldBatterySales to backup
        const snapshot = await get(oldBatterySalesRef);
        if (snapshot.exists()) {
          await set(oldBatterySalesBackupRef, snapshot.val());
        }
        
        // Now delete the oldBatterySales
        await remove(oldBatterySalesRef);
        
        showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} data has been reset successfully`, 'success');
        
        // Call the onReset callback if provided
        if (onReset) {
          onReset();
        }
        
        setIsResetting(false);
        return;
      }
      
      // For other sections, proceed with normal reset
      // Define the path based on the section
      let path = '';
      switch (section) {
        case 'sales':
          path = `users/${userId}/sales`;
          break;
        case 'purchases':
          path = `users/${userId}/purchases`;
          break;
        case 'stock':
          path = `users/${userId}/stockMovements`;
          break;
        case 'reports':
          // Reports don't have their own data, they use data from other sections
          showToast('Reports are generated from other sections. Please reset those sections instead.', 'info');
          setIsResetting(false);
          return;
      }

      // Delete the data at the specified path
      const dataRef = ref(database, path);
      await remove(dataRef);

      // If it's a section that has related items, delete those too
      // IMPORTANT: We're only deleting the records, NOT updating product stock quantities
      // This ensures that when resetting sales or purchases, product quantities remain unchanged
      if (section === 'sales') {
        const saleItemsRef = ref(database, `users/${userId}/saleItems`);
        await remove(saleItemsRef);
      } else if (section === 'purchases') {
        const purchaseItemsRef = ref(database, `users/${userId}/purchaseItems`);
        await remove(purchaseItemsRef);
      }

      // We intentionally do NOT update product stock quantities when resetting sales or purchases
      // This is per the requirement that reset should not affect product quantities

      showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} data has been reset successfully`, 'success');
      
      // Call the onReset callback if provided
      if (onReset) {
        onReset();
      }
    } catch (error) {
      console.error(`Error resetting ${section} data:`, error);
      showToast(`Error resetting ${section} data. Please try again.`, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
    >
      {isResetting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span>Resetting...</span>
        </>
      ) : (
        <>
          <Trash2 size={16} className="mr-2" />
          <span>Reset {section.charAt(0).toUpperCase() + section.slice(1)}</span>
        </>
      )}
    </button>
  );
};

export default ResetButton;