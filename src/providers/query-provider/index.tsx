import { PropsWithChildren } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { emitToast } from '@/utils/toast-bus';
import { getErrorAction, getUserMessage, normalizeError } from '@/utils/error-handler';

const handleGlobalError = (error: unknown) => {
  const normalized = normalizeError(error);
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
