import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
        token: null,
        user: null,
        setAuth: (token, user) => set({ token, user }),
        logout: () => set({ token: null, user: null }),
        }),
        { name: 'auth-storage' }
    )
);
export default useAuthStore;