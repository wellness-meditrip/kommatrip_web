import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { AdminRouteRenderer } from '@/components/admin/admin-route-renderer';
import { LazyGlobalLoginModal } from '@/components/auth/LazyGlobalLoginModal';
import { ChatbotLauncher } from '@/components/chatbot';
import type { AuthBootstrapMode } from '@/seo/page-policy';

const AuthBootstrap = dynamic(
  () => import('@/components/auth/AuthBootstrap').then((mod) => mod.AuthBootstrap),
  {
    ssr: false,
    loading: () => null,
  }
);

const BackgroundAuthWarmup = dynamic(
  () => import('@/components/auth/AuthBootstrap').then((mod) => mod.BackgroundAuthWarmup),
  {
    ssr: false,
    loading: () => null,
  }
);

interface AppPageRendererProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
  isAdminRoute: boolean;
  isAdminLoginRoute: boolean;
  authBootstrapMode: AuthBootstrapMode;
}

function UserAppContent({
  Component,
  pageProps,
}: Pick<AppPageRendererProps, 'Component' | 'pageProps'>) {
  return (
    <>
      <Component {...pageProps} />
      <LazyGlobalLoginModal />
      <ChatbotLauncher />
    </>
  );
}

export function AppPageRenderer({
  Component,
  pageProps,
  isAdminRoute,
  isAdminLoginRoute,
  authBootstrapMode,
}: AppPageRendererProps) {
  if (isAdminRoute) {
    return (
      <AdminRouteRenderer
        key={isAdminLoginRoute ? 'admin-login-route' : 'admin-protected-route'}
        Component={Component}
        pageProps={pageProps}
        isLoginRoute={isAdminLoginRoute}
      />
    );
  }

  if (authBootstrapMode === 'none') {
    return <Component {...pageProps} />;
  }

  const userAppContent = <UserAppContent Component={Component} pageProps={pageProps} />;

  if (authBootstrapMode === 'blocking') {
    return <AuthBootstrap>{userAppContent}</AuthBootstrap>;
  }

  return (
    <>
      <BackgroundAuthWarmup />
      {userAppContent}
    </>
  );
}
