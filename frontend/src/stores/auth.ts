import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    hasHydrated: boolean;
    setAuth: (token: string, user: User, refreshToken?: string | null) => void;
    setToken: (token: string, refreshToken?: string | null) => void;
    logout: () => void;
    setHasHydrated: (value: boolean) => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
        token: null,
        refreshToken: null,
        user: null,
        hasHydrated: false,
        setAuth: (token, user, refreshToken = null) => set({ token, user, refreshToken }),
        setToken: (token, refreshToken) => set((state) => ({
            token,
            refreshToken: refreshToken ?? state.refreshToken,
        })),
        logout: () => set({ token: null, refreshToken: null, user: null }),
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
