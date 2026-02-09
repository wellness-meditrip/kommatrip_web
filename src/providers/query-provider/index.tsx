import { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { emitToast } from '@/utils/toast-bus';
import { getErrorAction, getUserMessage, normalizeError } from '@/utils/error-handler';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const normalized = normalizeError(error);
        if (normalized.status && [401, 403, 404].includes(normalized.status)) return false;
        return failureCount < 2;
      },
      onError: (error, query) => {
        if (query?.meta?.suppressGlobalError) return;
        const action = getErrorAction(error);
        if (action === 'toast') {
          emitToast({ title: getUserMessage(error), icon: 'exclaim' });
        }
      },
    },
    mutations: {
      onError: (error, _variables, context) => {
        if (context?.suppressGlobalError) return;
        const action = getErrorAction(error);
        if (action === 'toast') {
          emitToast({ title: getUserMessage(error), icon: 'exclaim' });
        }
      },
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
