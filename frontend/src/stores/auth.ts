import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
    token: string | null;
    user: User | null;
    hasHydrated: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    setHasHydrated: (value: boolean) => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
        token: null,
        user: null,
        hasHydrated: false,
        setAuth: (token, user) => set({ token, user }),
        logout: () => set({ token: null, user: null }),
        setHasHydrated: (value) => set({ hasHydrated: value }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
export default useAuthStore;
