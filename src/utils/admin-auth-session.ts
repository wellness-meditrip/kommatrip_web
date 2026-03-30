import type { AdminAuthUser } from '@/models';
import { ADMIN_AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { useAdminAuthStore } from '@/store/admin-auth';
import { deleteCookie } from '@/utils/cookie';

interface AdminAuthSessionPayload {
  user?: AdminAuthUser | null;
  tokens?: {
    access_token?: string | null;
  } | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const resolvePayload = (payload: unknown): AdminAuthSessionPayload => {
  if (!isRecord(payload)) return {};
  if (isRecord(payload.data)) return payload.data as AdminAuthSessionPayload;
  return payload as AdminAuthSessionPayload;
};

export const applyAdminAuthSession = (payload: unknown) => {
  const resolvedPayload = resolvePayload(payload);
  const accessToken = resolvedPayload.tokens?.access_token;
  const user = resolvedPayload.user;

  if (!accessToken || !user) {
    return false;
  }

  useAdminAuthStore.getState().setAuth(accessToken, user);
  return true;
};

export const clearClientAdminAuthSession = async () => {
  useAdminAuthStore.getState().clearAuth();
  deleteCookie(ADMIN_AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);

  try {
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('[AdminAuthSession] failed to clear admin auth cookies', error);
  }
};
