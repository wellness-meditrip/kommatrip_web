import Document, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from 'next/document';
import { detectRequestLocale } from '@/i18n/locale';
import type { Locale } from '@/i18n/routing';

interface MyDocumentProps extends DocumentInitialProps {
  locale: Locale;
}

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(context: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await Document.getInitialProps(context);
    const locale = detectRequestLocale({
      locale: context.locale,
      localeHeader: context.req?.headers['x-locale'],
      pathname: context.req?.url ?? context.pathname,
      cookieHeader: context.req?.headers.cookie,
    });

    return {
      ...initialProps,
      locale,
    };
  }

  render() {
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

    return (
      <Html lang={this.props.locale} suppressHydrationWarning>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          {gtmId && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    ad_storage: 'denied',
                    analytics_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied'
                  });
                `,
              }}
            />
          )}
        </Head>
        <body>
          {gtmId && (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          )}
          <Main />
          <div id="portal-container" />
          <NextScript />
        </body>
      </Html>
    );
  }
}
