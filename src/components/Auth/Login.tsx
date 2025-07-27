import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Package } from 'lucide-react';
import Button from '../Common/Button';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, switchToSignup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nihal-light-blue to-nihal-silver flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img src="/company.png" alt="Nihal Battery House Logo" className="w-32 h-32 object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Nihal Battery House
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-lg shadow-md">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-nihal-blue focus:border-nihal-blue"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-nihal-blue focus:border-nihal-blue"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                icon={LogIn}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

         
            
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={switchToSignup}
                className="text-sm text-nihal-blue hover:text-nihal-blue hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;