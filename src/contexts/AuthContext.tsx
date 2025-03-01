'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, removeAuthToken } from '@/utils/auth';

interface AuthContextType {
  username: string | null;
  setUsername: (username: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a token and try to get the username
    const token = getAuthToken();
    if (token) {
      // You might want to validate the token and get user info from your API here
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('username');
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, setUsername, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 