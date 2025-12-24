import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';

import { DialogProvider, ToastProvider } from '@/hooks';
import { GlobalStyle } from '@/styles';
import { QueryProvider } from '@/providers';
import '@/styles/normalize.css';
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
        <QueryProvider>
          <GlobalStyle>
            <DialogProvider>
              <ToastProvider>
                <Component {...pageProps} />
              </ToastProvider>
            </DialogProvider>
          </GlobalStyle>
        </QueryProvider>
      </SessionProvider>
    </>
  );
}
