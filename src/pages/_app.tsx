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
import 'react-day-picker/dist/style.css';
import { useAuthSync } from '@/hooks/auth/use-auth-sync';

import Head from 'next/head';

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

  // URL에서 로케일 추출 (예: /ko/... 또는 /en/...)
  const pathLocale = router.asPath.split('/')[1];
  const locale: Locale =
    pathLocale && routing.locales.includes(pathLocale as Locale)
      ? (pathLocale as Locale)
      : routing.defaultLocale;

  // 클라이언트 사이드에서 메시지 로드
  useEffect(() => {
    const loadMessages = async () => {
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
  }, [locale]);

  return (
    <>
      <Head>
        <title>meditrip - 글로벌 웰니스를 위한 한의학 플랫폼</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1.0"
        />
      </Head>
      <SessionProvider session={session}>
        <AuthSync />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <GlobalStyle>
              <DialogProvider>
                <ToastProvider>
                  {isLoading ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        fontSize: '16px',
                      }}
                    >
                      Loading...
                    </div>
                  ) : (
                    <Component {...pageProps} />
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
