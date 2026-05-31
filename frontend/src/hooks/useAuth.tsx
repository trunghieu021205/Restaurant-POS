// hooks/useAuth.ts
'use client';

import { createContext, useContext, ReactNode } from 'react';
import useAuthStore from '@/stores/auth';
import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, token, setAuth, logout } = useAuthStore();
  const isLoading = false;

  const login = async (email: string, password: string) => {
    // Login is handled by the auth service in the login page
    // This function is kept for backward compatibility
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}