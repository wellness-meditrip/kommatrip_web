import type { ReactNode } from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { SkeletonTheme } from 'react-loading-skeleton';
import type { Locale } from '@/i18n/routing';
import { DialogProvider, ToastProvider } from '@/hooks';
import { QueryProvider } from '@/providers';
import { GlobalStyle, theme } from '@/styles';

const warnedMissingMessages = new Set<string>();

interface AppProvidersProps {
  locale: Locale;
  messages: Record<string, unknown>;
  dehydratedState?: DehydratedState;
  children: ReactNode;
}

export function AppProviders({ locale, messages, dehydratedState, children }: AppProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if ((error as { code?: string })?.code === 'MISSING_MESSAGE') {
          if (process.env.NODE_ENV !== 'production') {
            const missingError = error as {
              namespace?: string;
              key?: string;
              message?: string;
            };
            const namespace = missingError.namespace ?? 'unknown';
            const key = missingError.key ?? missingError.message ?? 'unknown';
            const dedupeKey = `${locale}:${namespace}:${key}`;

            if (!warnedMissingMessages.has(dedupeKey)) {
              warnedMissingMessages.add(dedupeKey);
              console.warn(`[i18n] Missing message (${locale}): ${namespace}.${key}`);
            }
          }

          return;
        }

        console.error(error);
      }}
      getMessageFallback={({ namespace, key }) => {
        const prefix = namespace ? `${namespace}.` : '';
        return `${prefix}${key}`;
      }}
    >
      <QueryProvider dehydratedState={dehydratedState}>
        <SkeletonTheme
          baseColor={theme.colors.gray200}
          highlightColor={theme.colors.gray100}
          borderRadius={8}
          duration={1.4}
        >
          <GlobalStyle>
            <DialogProvider>
              <ToastProvider>{children}</ToastProvider>
            </DialogProvider>
          </GlobalStyle>
        </SkeletonTheme>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
