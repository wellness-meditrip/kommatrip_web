import { create } from 'zustand';
import type { AdminAuthUser } from '@/models';
import { isUsableAccessToken } from '@/utils/auth-token';

export type AdminAuthLifecycleState = 'hydrating' | 'refreshing' | 'authenticated' | 'guest';

interface AdminAuthState {
  accessToken: string | null;
  user: AdminAuthUser | null;
  authState: AdminAuthLifecycleState;
  hasRefreshToken: boolean;
  isBootstrapped: boolean;
  setAuth: (token: string, user: AdminAuthUser) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: AdminAuthUser | null) => void;
  setAuthState: (state: AdminAuthLifecycleState) => void;
  setHasRefreshToken: (hasRefreshToken: boolean) => void;
  setBootstrapped: (isBootstrapped: boolean) => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
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
  setAccessToken: (token) =>
    set((prev) => ({
      ...prev,
      accessToken: token,
      authState: isUsableAccessToken(token) ? 'authenticated' : 'guest',
    })),
  setUser: (user) =>
    set((prev) => ({
      ...prev,
      user,
    })),
  setAuthState: (state) =>
    set((prev) => (prev.authState === state ? prev : { ...prev, authState: state })),
  setHasRefreshToken: (hasRefreshToken) =>
    set((prev) => (prev.hasRefreshToken === hasRefreshToken ? prev : { ...prev, hasRefreshToken })),
  setBootstrapped: (isBootstrapped) =>
    set((prev) => (prev.isBootstrapped === isBootstrapped ? prev : { ...prev, isBootstrapped })),
  clearAuth: () =>
    set((prev) => ({
      ...prev,
      accessToken: null,
      user: null,
      authState: 'guest',
      hasRefreshToken: false,
    })),
}));
