import type { User } from '@/models/auth';
import { AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { ROUTES } from '@/constants/commons/routes';
import { useAuthStore } from '@/store/auth';
import { deleteCookie } from '@/utils/cookie';

interface AuthSessionPayload {
  user?: User | null;
  tokens?: {
    access_token?: string | null;
  } | null;
}

const LOGOUT_REDIRECT_STORAGE_KEY = 'logout_redirect_pending';

export const applyAuthSession = (payload: AuthSessionPayload) => {
  const accessToken = payload.tokens?.access_token;
  const user = payload.user;

  if (!accessToken || !user) {
    return false;
  }

  useAuthStore.getState().setAuth(accessToken, user);
  return true;
};

export const clearClientAuthSession = async () => {
  useAuthStore.getState().clearAuth();
  deleteCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('[AuthSession] failed to clear auth cookies', error);
  }
};

export const markLogoutRedirectPending = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(LOGOUT_REDIRECT_STORAGE_KEY, '1');
};

export const clearLogoutRedirectPending = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(LOGOUT_REDIRECT_STORAGE_KEY);
};

export const isLogoutRedirectPending = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(LOGOUT_REDIRECT_STORAGE_KEY) === '1';
};

export const resolveSafeAuthRedirect = (value: unknown, fallback = ROUTES.HOME) => {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  return value;
};
