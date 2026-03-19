import { PropsWithChildren } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { emitToast } from '@/utils/toast-bus';
import { useAuthStore } from '@/store/auth';
import { isAuthRefreshInFlight } from '@/utils/auth-refresh';
import { getErrorAction, getUserMessage, normalizeError } from '@/utils/error-handler';

const shouldSuppressAuthToast = (status?: number): boolean => {
  if (status !== 401 && status !== 403) return false;
  const authState = useAuthStore.getState().authState;
  if (authState === 'hydrating' || authState === 'refreshing') return true;
  if (isAuthRefreshInFlight()) return true;
  return false;
};

const handleGlobalError = (error: unknown) => {
  const normalized = normalizeError(error);
  if (normalized.code === 'AUTH_SESSION_EXPIRED') return;
  if (shouldSuppressAuthToast(normalized.status)) return;
  const action = getErrorAction(normalized);
  if (action === 'toast') {
    emitToast({ title: getUserMessage(normalized), icon: 'exclaim' });
  }
};

const queryCache = new QueryCache({
  onError: (error, query) => {
    if (query?.meta?.suppressGlobalError) return;
    handleGlobalError(error);
  },
});

const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (mutation?.meta?.suppressGlobalError) return;
    handleGlobalError(error);
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Global error handling is intentionally minimal.
      // Business-specific error UX is handled at page or local level.
      retry: (failureCount, error) => {
        const normalized = normalizeError(error);
        if (normalized.status && [401, 403, 404].includes(normalized.status)) return false;
        return failureCount < 2;
      },
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
