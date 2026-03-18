import { create } from 'zustand';
import type { User } from '@/models/auth';
import { isUsableAccessToken } from '@/utils/auth-token';

export type AuthLifecycleState = 'hydrating' | 'refreshing' | 'authenticated' | 'guest';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  authState: AuthLifecycleState;
  hasRefreshToken: boolean;
  isBootstrapped: boolean;
  setAuth: (token: string, user: User) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  patchUser: (user: Partial<User>) => void;
  setAuthState: (state: AuthLifecycleState) => void;
  setHasRefreshToken: (hasRefreshToken: boolean) => void;
  setBootstrapped: (isBootstrapped: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  authState: 'hydrating',
  hasRefreshToken: false,
  isBootstrapped: false,

  setAuth: (token, user) => {
    set({
      accessToken: token,
      user,
      authState: isUsableAccessToken(token) ? 'authenticated' : 'guest',
      hasRefreshToken: true,
    });
  },
  setAccessToken: (token) => {
    set((prev) => ({
      ...prev,
      accessToken: token,
      authState: isUsableAccessToken(token) ? 'authenticated' : 'guest',
    }));
  },
  setUser: (user) =>
    set((prev) => ({
      ...prev,
      user,
    })),
  patchUser: (user) =>
    set((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...user } : prev.user,
    })),
  setAuthState: (state) =>
    set((prev) => (prev.authState === state ? prev : { ...prev, authState: state })),
  setHasRefreshToken: (hasRefreshToken) =>
    set((prev) => (prev.hasRefreshToken === hasRefreshToken ? prev : { ...prev, hasRefreshToken })),
  setBootstrapped: (isBootstrapped) =>
    set((prev) => (prev.isBootstrapped === isBootstrapped ? prev : { ...prev, isBootstrapped })),
  clearAuth: () => {
    set((prev) => ({
      ...prev,
      accessToken: null,
      user: null,
      authState: 'guest',
      hasRefreshToken: false,
    }));
  },
}));
