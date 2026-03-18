import type { AdminAuthTokens, AdminAuthUser, AdminLoginResponse } from '@/models';
import { ADMIN_AUTH_CHANGE_EVENT, ADMIN_STORAGE_KEYS } from '@/constants';

interface AdminAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AdminAuthUser | null;
}

const isBrowser = () => typeof window !== 'undefined';

const dispatchAdminAuthChange = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
};

const parseStoredUser = (value: string | null): AdminAuthUser | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as AdminAuthUser;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.id !== 'number') return null;
    if (typeof parsed.email !== 'string') return null;
    if (typeof parsed.username !== 'string') return null;
    if (typeof parsed.role !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const readAdminAuthState = (): AdminAuthState => {
  if (!isBrowser()) {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }

  return {
    accessToken: window.localStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: window.localStorage.getItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN),
    user: parseStoredUser(window.localStorage.getItem(ADMIN_STORAGE_KEYS.USER)),
  };
};

export const persistAdminAuthSession = (payload: {
  tokens: AdminAuthTokens;
  user: AdminAuthUser;
}) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN, payload.tokens.access_token);
  window.localStorage.setItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN, payload.tokens.refresh_token);
  window.localStorage.setItem(ADMIN_STORAGE_KEYS.USER, JSON.stringify(payload.user));
  dispatchAdminAuthChange();
};

export const persistAdminAuthFromResponse = (payload: AdminLoginResponse) => {
  persistAdminAuthSession({
    tokens: payload.tokens,
    user: payload.user,
  });
};

export const updateAdminTokens = (tokens: AdminAuthTokens, user?: AdminAuthUser | null) => {
  const currentState = readAdminAuthState();
  const resolvedUser = user ?? currentState.user;
  if (!resolvedUser) return;

  persistAdminAuthSession({
    tokens,
    user: resolvedUser,
  });
};

export const clearAdminAuthSession = () => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(ADMIN_STORAGE_KEYS.REFRESH_TOKEN);
  window.localStorage.removeItem(ADMIN_STORAGE_KEYS.USER);
  dispatchAdminAuthChange();
};
