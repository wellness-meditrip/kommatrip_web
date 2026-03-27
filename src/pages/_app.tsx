import type { AppProps } from 'next/app';
import type { DehydratedState } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { AuthBootstrap } from '@/components/auth/AuthBootstrap';
import { GlobalLoginModal } from '@/components/auth/GlobalLoginModal';
import { DialogProvider, ToastProvider } from '@/hooks';
import { GlobalStyle, theme } from '@/styles';
import { QueryProvider } from '@/providers';
import { routing, type Locale } from '@/i18n/routing';
import type { I18nPageProps } from '@/i18n';
import '@/styles/normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuthSync } from '@/hooks/auth/use-auth-sync';
import { useAuthState } from '@/hooks/auth/use-auth-state';

import Head from 'next/head';
import { Meta, createPageMeta, type MetaProps } from '@/seo';
import { ChatbotLauncher } from '@/components';
import { SkeletonTheme } from 'react-loading-skeleton';
import { AdminShell } from '@/components/admin/admin-shell';
import { PAGE_POLICIES, resolvePagePolicy, type PagePolicyName } from '@/seo/page-policy';

const warnedMissingMessages = new Set<string>();
const EMPTY_MESSAGES: Record<string, unknown> = {};

/**
 * NextAuth 세션과 zustand auth store 동기화
 * 토큰 재발급은 API 인터셉터에서 401 + TOKEN_EXPIRED 발생 시 자동 처리
 */
function AuthSync() {
  useAuthState();
  useAuthSync();
  return null;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isAdminLoginRoute = router.pathname === '/admin/login';
  const initialPageProps = pageProps as Partial<I18nPageProps>;
  const dehydratedState = (pageProps as { dehydratedState?: DehydratedState }).dehydratedState;
  const initialLocale = initialPageProps.locale ?? routing.defaultLocale;
  const pageMessages = initialPageProps.messages as Record<string, unknown> | undefined;
  const initialMessages = pageMessages ?? EMPTY_MESSAGES;
  const pageLocale = initialPageProps.locale ?? routing.defaultLocale;
  const routePolicyName =
    (pageProps as { pagePolicy?: PagePolicyName }).pagePolicy ??
    resolvePagePolicy(router.pathname).name;
  const routePolicy = PAGE_POLICIES[routePolicyName];
  const [messageCache, setMessageCache] = useState<
    Partial<Record<Locale, Record<string, unknown>>>
  >(() => ({ [initialLocale]: initialMessages }));
  const defaultAppName = 'kommatrip';
  const defaultAppTitle = 'Korean Wellness & K-beauty Tours in Seoul';
  const defaultAppDescription =
    'kommatrip is your guide to Korean Wellness & K-beauty tours in Seoul';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    const pageLocale = initialPageProps.locale;
    const pageMessages = initialPageProps.messages;
    if (!pageLocale || !pageMessages) return;

    setMessageCache((prev) => {
      const existingMessages = prev[pageLocale] ?? {};
      const hasAllNamespaces = Object.keys(pageMessages).every((key) =>
        Object.prototype.hasOwnProperty.call(existingMessages, key)
      );

      if (hasAllNamespaces) return prev;

      return {
        ...prev,
        [pageLocale]: {
          ...existingMessages,
          ...pageMessages,
        },
      };
    });
  }, [initialPageProps.locale, initialPageProps.messages]);

  const messages = useMemo(
    () => messageCache[pageLocale] ?? pageMessages ?? EMPTY_MESSAGES,
    [messageCache, pageLocale, pageMessages]
  );

  const appName =
    (messages?.common as { app?: { name?: string } } | undefined)?.app?.name || defaultAppName;
  const appTitle =
    (messages?.common as { app?: { title?: string } } | undefined)?.app?.title || defaultAppTitle;
  const pageTitle = `${appName} | ${appTitle}`;
  const pageDescription =
    (messages?.common as { app?: { description?: string } } | undefined)?.app?.description ||
    defaultAppDescription;
  const pageMeta = (pageProps as { meta?: MetaProps }).meta;
  const baseMeta = createPageMeta({
    pageTitle,
    description: pageDescription,
    path: router.asPath || '/',
    image: '/og/OG_image.jpg',
    policy: routePolicyName,
    noindex: routePolicy.noindex,
  });
  const resolvedMeta: MetaProps = pageMeta
    ? {
        ...baseMeta,
        ...pageMeta,
        noindex: routePolicy.noindex || pageMeta.noindex,
        robots:
          routePolicy.noindex || pageMeta.noindex
            ? 'noindex,nofollow'
            : (pageMeta.robots ?? baseMeta.robots),
        alternates: pageMeta.alternates ?? baseMeta.alternates,
      }
    : baseMeta;

  useEffect(() => {
    if (!gtmId) return;

    const handleRouteChange = (url: string) => {
      if (!window.dataLayer) return;
      window.dataLayer.push({
        event: 'page_view',
        page_location: window.location.href,
        page_path: url,
        page_title: document.title,
      });
    };

    if (router.isReady) {
      handleRouteChange(router.asPath);
    }

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [gtmId, router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Meta {...resolvedMeta} />
      {!isAdminRoute && <AuthSync />}
      <NextIntlClientProvider
        locale={pageLocale}
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
              const dedupeKey = `${pageLocale}:${namespace}:${key}`;
              if (!warnedMissingMessages.has(dedupeKey)) {
                warnedMissingMessages.add(dedupeKey);
                console.warn(`[i18n] Missing message (${pageLocale}): ${namespace}.${key}`);
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
                <ToastProvider>
                  {isAdminRoute && !isAdminLoginRoute ? (
                    <AdminShell>
                      <Component {...pageProps} />
                    </AdminShell>
                  ) : (
                    <AuthBootstrap>
                      <>
                        <Component {...pageProps} />
                        <GlobalLoginModal />
                        {!isAdminRoute && <ChatbotLauncher />}
                      </>
                    </AuthBootstrap>
                  )}
                </ToastProvider>
              </DialogProvider>
            </GlobalStyle>
          </SkeletonTheme>
        </QueryProvider>
      </NextIntlClientProvider>
    </>
  );
}
