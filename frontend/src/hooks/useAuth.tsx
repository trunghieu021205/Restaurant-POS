// hooks/useAuth.ts
'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
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
  const { user, hasHydrated, logout } = useAuthStore();
  const isLoading = !hasHydrated;

  const login = async (email: string, password: string) => {
    void email;
    void password;
    // Login is handled by the auth service in the login page
    // This function is kept for backward compatibility
  };

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'auth-logout-at') {
        useAuthStore.setState({ token: null, refreshToken: null, user: null });
      }
      if (event.key === 'auth-token-refreshed-at') {
        useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
