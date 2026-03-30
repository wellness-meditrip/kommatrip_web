import { useEffect } from 'react';
import { css } from '@emotion/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { postAdminTokenReissue } from '@/apis';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { ADMIN_AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { useAdminAuthStore } from '@/store/admin-auth';
import { getCookie } from '@/utils/cookie';
import { applyAdminAuthSession, clearClientAdminAuthSession } from '@/utils/admin-auth-session';
import { adminConsolePalette } from './admin-console.styles';
import { AdminShell } from './admin-shell';

interface AdminRouteRendererProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
  isLoginRoute: boolean;
}

let bootstrapPromise: Promise<void> | null = null;

const ensureAdminAuthBootstrapped = async () => {
  const adminStore = useAdminAuthStore.getState();
  if (adminStore.isBootstrapped) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const hasRefreshFlag = !!getCookie(ADMIN_AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
    adminStore.setHasRefreshToken(hasRefreshFlag);

    if (!hasRefreshFlag) {
      adminStore.setAuthState('guest');
      adminStore.setBootstrapped(true);
      return;
    }

    adminStore.setAuthState('refreshing');

    try {
      const response = await postAdminTokenReissue();
      const didApplySession = applyAdminAuthSession(response);

      if (!didApplySession) {
        throw new Error('Missing admin session payload during bootstrap');
      }

      adminStore.setHasRefreshToken(true);
    } catch (error) {
      console.error('[AdminAuthBootstrap] token bootstrap failed', error);
      await clearClientAdminAuthSession();
    } finally {
      useAdminAuthStore.getState().setBootstrapped(true);
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
};

function useBootstrapAdminAuth() {
  const isBootstrapped = useAdminAuthStore((state) => state.isBootstrapped);

  useEffect(() => {
    if (!isBootstrapped) {
      void ensureAdminAuthBootstrapped();
    }
  }, [isBootstrapped]);

  return isBootstrapped;
}

const resolveAdminRedirectTarget = (path: string) => {
  const nextPath = path && path !== ROUTES.ADMIN_LOGIN ? path : '';
  return nextPath
    ? `${ROUTES.ADMIN_LOGIN}?next=${encodeURIComponent(nextPath)}`
    : ROUTES.ADMIN_LOGIN;
};

const resolveAdminNextPath = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] ?? ROUTES.ADMIN_DASHBOARD;
  if (typeof value === 'string' && value.startsWith('/')) return value;
  return ROUTES.ADMIN_DASHBOARD;
};

function AdminRouteLoading({ title }: { title: string }) {
  return (
    <div css={loadingPage}>
      <div css={loadingCard}>
        <Text tag="h1" typo="title1" css={loadingTitle}>
          Admin Company Console
        </Text>
        <Text typo="body9" css={loadingDescription}>
          {title}
        </Text>
      </div>
    </div>
  );
}

export function AdminRouteRenderer({
  Component,
  pageProps,
  isLoginRoute,
}: AdminRouteRendererProps) {
  const router = useRouter();
  const isBootstrapped = useBootstrapAdminAuth();
  const authState = useAdminAuthStore((state) => state.authState);
  const isAuthenticated = authState === 'authenticated';

  useEffect(() => {
    if (!isBootstrapped || isLoginRoute || isAuthenticated) return;
    void router.replace(resolveAdminRedirectTarget(router.asPath));
  }, [isAuthenticated, isBootstrapped, isLoginRoute, router]);

  useEffect(() => {
    if (!isBootstrapped || !isLoginRoute || !isAuthenticated) return;
    void router.replace(resolveAdminNextPath(router.query.next));
  }, [isAuthenticated, isBootstrapped, isLoginRoute, router, router.query.next]);

  if (!isBootstrapped) {
    if (isLoginRoute) {
      return <Component {...pageProps} />;
    }
    return (
      <AdminShell>
        <Component {...pageProps} />
      </AdminShell>
    );
  }

  if (isLoginRoute) {
    return <Component {...pageProps} />;
  }

  if (!isAuthenticated) {
    return <AdminRouteLoading title="로그인 페이지로 이동하는 중입니다." />;
  }

  return (
    <AdminShell>
      <Component {...pageProps} />
    </AdminShell>
  );
}

const loadingPage = css`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(132, 155, 130, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(111, 102, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0b1422 0%, #050b15 100%);
`;

const loadingCard = css`
  width: 100%;
  max-width: 440px;
  padding: 32px;
  border-radius: 28px;
  background: rgba(14, 22, 35, 0.96);
  border: 1px solid ${adminConsolePalette.borderSoft};
  box-shadow: 0 30px 80px rgba(2, 6, 14, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
`;

const loadingTitle = css`
  color: ${adminConsolePalette.textStrong};
`;

const loadingDescription = css`
  color: ${adminConsolePalette.textSubtle};
`;
