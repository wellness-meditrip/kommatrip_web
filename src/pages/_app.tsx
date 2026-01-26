import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { DialogProvider, ToastProvider } from '@/hooks';
import { GlobalStyle } from '@/styles';
import { QueryProvider } from '@/providers';
import { routing, type Locale } from '@/i18n/routing';
import '@/styles/normalize.css';
import { useAuthSync } from '@/hooks/auth/use-auth-sync';

import Head from 'next/head';
import { Meta, createPageMeta, type MetaProps } from '@/seo';
import { ChatbotLauncher, Loading } from '@/components';

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
  const [messages, setMessages] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [locale, setLocale] = useState<Locale>(routing.defaultLocale);
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

  const loadingMessageByLocale: Record<Locale, string> = {
    en: 'Loading...',
    ko: '로딩 중...',
    ja: '読み込み中...',
  };

  // 클라이언트 사이드에서 메시지 로드
  useEffect(() => {
    if (!isLocaleReady) return;
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        // API 라우트를 통해 메시지 로드
        const response = await fetch(`/api/i18n/${locale}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || {});
        } else {
          console.error('Failed to load messages from API');
          setMessages({});
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages({});
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [locale, isLocaleReady]);

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
            <GlobalStyle>
              <DialogProvider>
                <ToastProvider>
                  {isLoading ? (
                    <Loading title={loadingMessageByLocale[locale]} />
                  ) : (
                    <>
                      <Component {...pageProps} />
                      <ChatbotLauncher />
                    </>
                  )}
                </ToastProvider>
              </DialogProvider>
            </GlobalStyle>
          </QueryProvider>
        </NextIntlClientProvider>
      </SessionProvider>
    </>
  );
}
