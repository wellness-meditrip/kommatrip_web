import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { LazyGlobalLoginModal } from '@/components/auth/LazyGlobalLoginModal';
import { ChatbotLauncher } from '@/components/chatbot';
import type { AuthBootstrapMode } from '@/seo/page-policy';

const AdminShell = dynamic(
  () => import('@/components/admin/admin-shell').then((mod) => mod.AdminShell),
  {
    loading: () => null,
  }
);

const AuthBootstrap = dynamic(
  () => import('@/components/auth/AuthBootstrap').then((mod) => mod.AuthBootstrap),
  {
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
  if (isAdminRoute && !isAdminLoginRoute) {
    return (
      <AdminShell>
        <Component {...pageProps} />
      </AdminShell>
    );
  }

  if (isAdminRoute || authBootstrapMode === 'none') {
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
