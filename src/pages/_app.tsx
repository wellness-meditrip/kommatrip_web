import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { DialogProvider, ToastProvider } from '@/hooks';
import { GlobalStyle, theme } from '@/styles';
import { QueryProvider } from '@/providers';
import { routing, type Locale } from '@/i18n/routing';
import type { I18nPageProps } from '@/i18n';
import '@/styles/normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuthSync } from '@/hooks/auth/use-auth-sync';

import Head from 'next/head';
import { Meta, createPageMeta, type MetaProps } from '@/seo';
import { ChatbotLauncher } from '@/components';
import { SkeletonTheme } from 'react-loading-skeleton';

/**
 * NextAuth 세션과 zustand auth store 동기화
 * 토큰 재발급은 API 인터셉터에서 401 + TOKEN_EXPIRED 발생 시 자동 처리
 */
function AuthSync() {
  useAuthSync();
  return null;
}

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const initialPageProps = pageProps as Partial<I18nPageProps>;
  const initialLocale = initialPageProps.locale ?? routing.defaultLocale;
  const [messageCache, setMessageCache] = useState<
    Partial<Record<Locale, Record<string, unknown>>>
  >(() => (initialPageProps.messages ? { [initialLocale]: initialPageProps.messages } : {}));
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const defaultAppName = 'kommatrip';
  const defaultAppTitle = 'Korean Wellness & K-beauty Tours in Seoul';
  const defaultAppDescription =
    'kommatrip is your guide to Korean Wellness & K-beauty tours in Seoul';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    if (!router.isReady) return;
    const pathLocale = router.asPath.split('/')[1];
    const resolvedLocale =
      pathLocale && routing.locales.includes(pathLocale as Locale)
        ? (pathLocale as Locale)
        : routing.defaultLocale;
    setLocale(resolvedLocale);
    setIsLocaleReady(true);
  }, [router.asPath, router.isReady]);

  useEffect(() => {
    const pageLocale = initialPageProps.locale;
    const pageMessages = initialPageProps.messages;
    if (!pageLocale || !pageMessages) return;

    setMessageCache((prev) => {
      if (prev[pageLocale]) return prev;
      return { ...prev, [pageLocale]: pageMessages };
    });
  }, [initialPageProps.locale, initialPageProps.messages]);

  // 클라이언트 사이드 메시지 로드는 비차단으로 처리하고, 기존 화면은 유지한다.
  useEffect(() => {
    if (!isLocaleReady) return;
    if (messageCache[locale]) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/i18n/${locale}`);
        if (!response.ok) return;
        const data = (await response.json()) as { messages?: Record<string, unknown> };
        if (!data.messages) return;

        setMessageCache((prev) => ({ ...prev, [locale]: data.messages! }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [locale, isLocaleReady, messageCache]);

  const messages = useMemo(
    () => messageCache[locale] ?? initialPageProps.messages ?? {},
    [initialPageProps.messages, locale, messageCache]
  );

  const appName =
    (messages?.common as { app?: { name?: string } } | undefined)?.app?.name || defaultAppName;
  const appTitle =
    (messages?.common as { app?: { title?: string } } | undefined)?.app?.title || defaultAppTitle;
  const pageTitle = `${appName} | ${appTitle}`;
  const pageDescription =
    (messages?.common as { app?: { description?: string } } | undefined)?.app?.description ||
    defaultAppDescription;
  const resolvedMeta: MetaProps =
    (pageProps as { meta?: MetaProps }).meta ??
    createPageMeta({
      pageTitle,
      description: pageDescription,
      path: router.asPath || '/',
      image: '/og/OG_image.jpg',
    });

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1.0"
        />
      </Head>
      <Meta {...resolvedMeta} />
      <SessionProvider session={session}>
        <AuthSync />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <SkeletonTheme
              baseColor={theme.colors.gray200}
              highlightColor={theme.colors.gray100}
              borderRadius={8}
              duration={1.4}
            >
              <GlobalStyle>
                <DialogProvider>
                  <ToastProvider>
                    <>
                      <Component {...pageProps} />
                      <ChatbotLauncher />
                    </>
                  </ToastProvider>
                </DialogProvider>
              </GlobalStyle>
            </SkeletonTheme>
          </QueryProvider>
        </NextIntlClientProvider>
      </SessionProvider>
    </>
  );
}
