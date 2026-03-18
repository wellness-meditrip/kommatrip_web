import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore, type AuthLifecycleState } from '@/store/auth';
import { getCookie } from '@/utils/cookie';
import { isAuthRefreshInFlight } from '@/utils/auth-refresh';
import { isUsableAccessToken } from '@/utils/auth-token';
import { AUTH_COOKIE_KEYS } from '@/constants';

const TOKEN_STALE_WINDOW_SECONDS = 30;

interface UseAuthStateResult {
  authState: AuthLifecycleState;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRefreshToken: boolean;
}

export function useAuthState(): UseAuthStateResult {
  const { data: session, status } = useSession();
  const accessToken = useAuthStore((state) => state.accessToken);
  const authStateInStore = useAuthStore((state) => state.authState);
  const setAuthState = useAuthStore((state) => state.setAuthState);

  const hasRefreshToken = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
  const hasStoreToken = isUsableAccessToken(accessToken, TOKEN_STALE_WINDOW_SECONDS);
  const hasSessionToken = isUsableAccessToken(session?.accessToken, TOKEN_STALE_WINDOW_SECONDS);
  const hasSessionAccessToken =
    typeof session?.accessToken === 'string' && session.accessToken.length > 0;
  const isRefreshing = isAuthRefreshInFlight();

  const authState = useMemo<AuthLifecycleState>(() => {
    if (status === 'loading') return 'hydrating';
    if (isRefreshing) return 'refreshing';
    if (hasStoreToken || hasSessionToken) return 'authenticated';
    if (status === 'authenticated' && hasSessionAccessToken) return 'refreshing';
    if (hasRefreshToken) return 'refreshing';
    return 'guest';
  }, [
    status,
    isRefreshing,
    hasStoreToken,
    hasSessionToken,
    hasSessionAccessToken,
    hasRefreshToken,
  ]);

  useEffect(() => {
    if (authStateInStore !== authState) {
      setAuthState(authState);
    }
  }, [authState, authStateInStore, setAuthState]);

  return {
    authState,
    isAuthenticated: authState === 'authenticated',
    isLoading: authState === 'hydrating' || authState === 'refreshing',
    hasRefreshToken,
  };
}
