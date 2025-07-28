import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserPlus, Package, Mail, Lock, User } from 'lucide-react';
import Button from '../Common/Button';
import { AssetImage, getAssetPath } from '../../utils/assetUtils';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, switchToLogin } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    console.log('Sign up form submitted');

    // Validate form
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      showToast('Password must be at least 6 characters', 'error');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting to register with:', { username, email });
      const result = await register(username, email, password);
      console.log('Registration result:', result);
      
      if (result) {
        setSuccess('Account created successfully! Redirecting to login...');
        showToast('Account created successfully! Redirecting to login...', 'success');
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('Failed to create account. Username may already exist.');
        showToast('Failed to create account. Username may already exist.', 'error');
      }
    } catch (err) {
      setError('An error occurred during registration');
      showToast('An error occurred during registration', 'error');
      console.error('Registration error:', err);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-nihal-blue flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <AssetImage src="company.png" alt="Nihal Battery House Logo" className="w-32 h-32 object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
             Nihal Battery House
          </h2>
          <p className="mt-2 text-sm text-gray-400">
           Create a new account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-md text-white text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-md text-white text-sm">
              {success}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full px-3 py-3 border border-gray-700 bg-nihal-blue text-white rounded-md focus:outline-none focus:ring-1 focus:ring-nihal-yellow"
                  placeholder="Choose a username"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User size={20} className="text-nihal-yellow" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full px-3 py-3 border border-gray-700 bg-nihal-blue text-white rounded-md focus:outline-none focus:ring-1 focus:ring-nihal-yellow"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Mail size={20} className="text-nihal-yellow" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-3 border border-gray-700 bg-nihal-blue text-white rounded-md focus:outline-none focus:ring-1 focus:ring-nihal-yellow"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock size={20} className="text-nihal-yellow" />
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full px-3 py-3 border border-gray-700 bg-nihal-blue text-white rounded-md focus:outline-none focus:ring-1 focus:ring-nihal-yellow"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock size={20} className="text-nihal-yellow" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-nihal-yellow text-nihal-blue font-medium rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nihal-yellow"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>

          <div className="flex justify-center">
            <button 
              type="button" 
              onClick={switchToLogin}
              className="text-sm text-white hover:text-nihal-yellow"
            >
               Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;