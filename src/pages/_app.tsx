import type { AppProps } from 'next/app';
import type { DehydratedState } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { I18nPageProps } from '@/i18n';
import { AppPageRenderer } from '@/components/app-shell/app-page-renderer';
import { buildResolvedMeta } from '@/components/app-shell/app-meta';
import { AppProviders } from '@/components/app-shell/app-providers';
import { AppRuntime } from '@/components/app-shell/app-runtime';
import { useAppMessages } from '@/components/app-shell/use-app-messages';
import '@/styles/normalize.css';
import 'react-loading-skeleton/dist/skeleton.css';

import Head from 'next/head';
import { Meta, type MetaProps } from '@/seo';
import { PAGE_POLICIES, resolvePagePolicy, type PagePolicyName } from '@/seo/page-policy';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isAdminLoginRoute = router.pathname === '/admin/login';
  const initialPageProps = pageProps as Partial<I18nPageProps>;
  const dehydratedState = (pageProps as { dehydratedState?: DehydratedState }).dehydratedState;
  const { pageLocale, messages } = useAppMessages(initialPageProps);
  const routePolicyName =
    (pageProps as { pagePolicy?: PagePolicyName }).pagePolicy ??
    resolvePagePolicy(router.pathname).name;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const routePolicy = PAGE_POLICIES[routePolicyName];
  const authBootstrapMode = routePolicy.authBootstrapMode;
  const resolvedMeta: MetaProps = buildResolvedMeta({
    messages,
    routePolicyName,
    path: router.asPath || '/',
    pageMeta: (pageProps as { meta?: MetaProps }).meta,
  });

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Meta {...resolvedMeta} />
      <AppRuntime
        gtmId={gtmId}
        enableAnalytics={routePolicy.enableAnalytics}
        enableAuthSync={routePolicy.enableAuthSync}
      />
      <AppProviders locale={pageLocale} messages={messages} dehydratedState={dehydratedState}>
        <AppPageRenderer
          Component={Component}
          pageProps={pageProps}
          isAdminRoute={isAdminRoute}
          isAdminLoginRoute={isAdminLoginRoute}
          authBootstrapMode={authBootstrapMode}
        />
      </AppProviders>
    </>
  );
}
