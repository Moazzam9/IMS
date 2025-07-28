import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { LogIn, Package, Mail, Lock } from 'lucide-react';
import Button from '../Common/Button';
import { AssetImage, getAssetPath } from '../../utils/assetUtils';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchToSignup } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);
    if (!success) {
      showToast('Invalid username or password', 'error');
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
  Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="Email"
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
                  placeholder="Password"
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
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </div>

          <div className="flex justify-center">
            <button 
              type="button" 
              onClick={switchToSignup}
              className="text-sm text-white hover:text-nihal-yellow"
            >
               Don't have an account? Sign up
            </button>
          </div>
          
        
        </form>
      </div>
    </div>
  );
};

export default Login;