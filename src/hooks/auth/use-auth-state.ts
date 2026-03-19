import { useAuthStore, type AuthLifecycleState } from '@/store/auth';

interface UseAuthStateResult {
  authState: AuthLifecycleState;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRefreshToken: boolean;
}

export function useAuthState(): UseAuthStateResult {
  const authState = useAuthStore((state) => state.authState);
  const hasRefreshToken = useAuthStore((state) => state.hasRefreshToken);

  return {
    authState,
    isAuthenticated: authState === 'authenticated',
    isLoading: authState === 'hydrating' || authState === 'refreshing',
    hasRefreshToken,
  };
}
