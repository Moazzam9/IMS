import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { FirebaseService } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  authView: 'login' | 'signup';
  switchToLogin: () => void;
  switchToSignup: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const userData = await FirebaseService.getUserByFirebaseUid(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else {
            const newUserId = await FirebaseService.addUser({
              username: firebaseUser.email?.split('@')[0] || 'user',
              email: firebaseUser.email || '',
              role: 'staff',
              firebaseUid: firebaseUser.uid,
            });

            const newUser = await FirebaseService.getUserByFirebaseUid(firebaseUser.uid);
            if (newUser) setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // User state is set by onAuthStateChanged
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const existingUser = await FirebaseService.getUserByUsername(username);
      if (existingUser) {
        console.warn('Username already exists');
        return false;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUserId = await FirebaseService.addUser({
        username,
        email,
        role: 'staff',
        firebaseUid: firebaseUser.uid,
      });

      if (newUserId) {
        setTimeout(() => switchToLogin(), 2000); // Optional: auto switch to login
        return true;
      } else {
        await signOut(auth);
        console.error('Failed to create user in DB');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchToLogin = () => setAuthView('login');
  const switchToSignup = () => setAuthView('signup');

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        authView,
        switchToLogin,
        switchToSignup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
