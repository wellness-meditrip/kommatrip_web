import { useEffect, useMemo, useState } from 'react';
import type { I18nPageProps } from '@/i18n';
import { routing, type Locale } from '@/i18n/routing';

const EMPTY_MESSAGES: Record<string, unknown> = {};

type AppMessages = Record<string, unknown>;

export function useAppMessages(pageProps: Partial<I18nPageProps>) {
  const initialLocale = pageProps.locale ?? routing.defaultLocale;
  const pageLocale = pageProps.locale ?? routing.defaultLocale;
  const pageMessages = pageProps.messages as AppMessages | undefined;
  const initialMessages = pageMessages ?? EMPTY_MESSAGES;
  const [messageCache, setMessageCache] = useState<Partial<Record<Locale, AppMessages>>>(() => ({
    [initialLocale]: initialMessages,
  }));

  useEffect(() => {
    if (!pageProps.locale || !pageProps.messages) return;

    const locale = pageProps.locale;
    const nextMessages = pageProps.messages as AppMessages;

    setMessageCache((prev) => {
      const existingMessages = prev[locale] ?? {};
      const hasAllNamespaces = Object.keys(nextMessages).every((key) =>
        Object.prototype.hasOwnProperty.call(existingMessages, key)
      );

      if (hasAllNamespaces) return prev;

      return {
        ...prev,
        [locale]: {
          ...existingMessages,
          ...nextMessages,
        },
      };
    });
  }, [pageProps.locale, pageProps.messages]);

  const messages = useMemo(
    () => messageCache[pageLocale] ?? pageMessages ?? EMPTY_MESSAGES,
    [messageCache, pageLocale, pageMessages]
  );

  return {
    pageLocale,
    messages,
  };
}
