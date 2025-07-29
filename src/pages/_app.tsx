import type { AppProps } from 'next/app';
import { DialogProvider, ToastProvider } from '@/hooks';
import { GlobalStyle } from '@/styles';
import '@/styles/normalize.css';

import Head from 'next/head';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>meditrip - 글로벌 웰니스를 위한 한의학 플랫폼</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1.0"
        />
      </Head>
      <GlobalStyle>
        <DialogProvider>
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </DialogProvider>
      </GlobalStyle>
    </>
  );
}
