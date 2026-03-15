import { create } from 'zustand';
import { isUsableAccessToken } from '@/utils/auth-token';

export type AuthLifecycleState = 'hydrating' | 'refreshing' | 'authenticated' | 'guest';

interface AuthState {
  accessToken: string | null;
  authState: AuthLifecycleState;
  setAccessToken: (token: string | null) => void;
  setAuthState: (state: AuthLifecycleState) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  authState: 'hydrating',

  setAccessToken: (token) => {
    set({
      accessToken: token,
      authState: isUsableAccessToken(token) ? 'authenticated' : 'guest',
    });
  },
  setAuthState: (state) =>
    set((prev) => (prev.authState === state ? prev : { ...prev, authState: state })),
  clearAuth: () => {
    set({ accessToken: null, authState: 'guest' });
  },
}));
