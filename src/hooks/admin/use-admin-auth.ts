import { useCallback, useEffect, useState } from 'react';
import type { AdminAuthUser } from '@/models';
import { ADMIN_AUTH_CHANGE_EVENT } from '@/constants';
import { clearAdminAuthSession, readAdminAuthState } from '@/utils/admin-auth-storage';

interface AdminAuthState {
  isReady: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AdminAuthUser | null;
  logout: () => void;
}

const getInitialState = () => ({
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null as AdminAuthUser | null,
});

export const useAdminAuth = (): AdminAuthState => {
  const [state, setState] = useState(getInitialState);
  const [isReady, setIsReady] = useState(false);

  const syncState = useCallback(() => {
    setState(readAdminAuthState());
    setIsReady(true);
  }, []);

  useEffect(() => {
    syncState();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('admin')) {
        syncState();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, syncState);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, syncState);
    };
  }, [syncState]);

  const logout = useCallback(() => {
    clearAdminAuthSession();
    syncState();
  }, [syncState]);

  return {
    isReady,
    isAuthenticated: Boolean(state.accessToken && state.refreshToken && state.user),
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    user: state.user,
    logout,
  };
};
