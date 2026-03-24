import { PropsWithChildren, useState } from 'react';
import {
  HydrationBoundary,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from '@tanstack/react-query';
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

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query?.meta?.suppressGlobalError) return;
        handleGlobalError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation?.meta?.suppressGlobalError) return;
        handleGlobalError(error);
      },
    }),
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const normalized = normalizeError(error);
          if (normalized.status && [401, 403, 404].includes(normalized.status)) return false;
          return failureCount < 2;
        },
      },
    },
  });

interface QueryProviderProps extends PropsWithChildren {
  dehydratedState?: DehydratedState;
}

export function QueryProvider({ children, dehydratedState }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
