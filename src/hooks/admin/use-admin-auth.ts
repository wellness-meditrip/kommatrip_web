import { useCallback } from 'react';
import type { AdminAuthUser } from '@/models';
import type { AdminAuthLifecycleState } from '@/store/admin-auth';
import { useAdminAuthStore } from '@/store/admin-auth';
import { clearClientAdminAuthSession } from '@/utils/admin-auth-session';

interface AdminAuthState {
  isReady: boolean;
  isAuthenticated: boolean;
  authState: AdminAuthLifecycleState;
  accessToken: string | null;
  user: AdminAuthUser | null;
  logout: () => Promise<void>;
}

export const useAdminAuth = (): AdminAuthState => {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const user = useAdminAuthStore((state) => state.user);
  const authState = useAdminAuthStore((state) => state.authState);
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);
  const logout = useCallback(async () => {
    await clearClientAdminAuthSession();
  }, []);

  return {
    isReady: isBootstrapped,
    isAuthenticated: authState === 'authenticated',
    authState,
    accessToken,
    user,
    logout,
  };
};
