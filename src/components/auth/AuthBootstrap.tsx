import { PropsWithChildren, useEffect } from 'react';
import { css } from '@emotion/react';
import { Loading } from '@/components';
import { postTokenReissue } from '@/apis/auth';
import { AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { useAuthStore } from '@/store/auth';
import { beginAuthRefresh, rejectAuthRefresh, resolveAuthRefresh } from '@/utils/auth-refresh';
import { applyAuthSession, clearClientAuthSession } from '@/utils/auth-session';
import { getCookie } from '@/utils/cookie';

let bootstrapPromise: Promise<void> | null = null;

const ensureAuthBootstrapped = async () => {
  const authStore = useAuthStore.getState();
  if (authStore.isBootstrapped) return;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const hasRefreshFlag = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
    authStore.setHasRefreshToken(hasRefreshFlag);

    if (!hasRefreshFlag) {
      authStore.setAuthState('guest');
      authStore.setBootstrapped(true);
      return;
    }

    authStore.setAuthState('refreshing');
    beginAuthRefresh();

    try {
      const response = await postTokenReissue();
      const didApplySession = applyAuthSession(response);

      if (!didApplySession) {
        throw new Error('Missing auth session payload during bootstrap');
      }

      authStore.setHasRefreshToken(true);
      resolveAuthRefresh();
    } catch (error) {
      console.error('[AuthBootstrap] token bootstrap failed', error);
      await clearClientAuthSession();
      rejectAuthRefresh(error);
    } finally {
      useAuthStore.getState().setBootstrapped(true);
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
};

function useBootstrapAuth() {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  useEffect(() => {
    if (!isBootstrapped) {
      void ensureAuthBootstrapped();
    }
  }, [isBootstrapped]);

  return isBootstrapped;
}

export function AuthBootstrap({ children }: PropsWithChildren) {
  const isBootstrapped = useBootstrapAuth();

  if (!isBootstrapped) {
    return (
      <div css={loadingWrapper}>
        <Loading fullHeight title="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}

export function BackgroundAuthWarmup() {
  useBootstrapAuth();
  return null;
}

const loadingWrapper = css`
  display: flex;
  min-height: 100vh;
`;
