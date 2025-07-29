import React, { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Button from '../Common/Button';
import { useToast } from '../../contexts/ToastContext';

const PasswordChangeForm: React.FC = () => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setError('No user is currently logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      
      // Update the password
      await updatePassword(currentUser, newPassword);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      showToast('Password updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      if (error.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        setError('New password is too weak');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('This operation requires recent authentication. Please log in again before retrying.');
      } else {
        setError(`Failed to update password: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Updating...
            </>
          ) : 'Update Password'}
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;