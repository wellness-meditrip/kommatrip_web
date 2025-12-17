import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { DialogProvider, ToastProvider } from '@/hooks';
import { GlobalStyle } from '@/styles';
import { QueryProvider } from '@/providers';
import '@/styles/normalize.css';

import Head from 'next/head';

/**
 * 세션의 accessToken을 localStorage에 동기화하는 컴포넌트
 * 기존 API 클라이언트와의 호환성을 위해 필요합니다.
 */
function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      // NextAuth 세션의 accessToken을 localStorage에 저장
      // (기존 API 클라이언트가 localStorage를 사용하므로 호환성 유지)
      localStorage.setItem('accessToken', session.accessToken);
    } else if (session === null) {
      // 세션이 없으면 (로그아웃) localStorage에서 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [session]);

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
        <SessionSync />
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
