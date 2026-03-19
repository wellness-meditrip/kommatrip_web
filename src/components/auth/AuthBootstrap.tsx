import { PropsWithChildren, useEffect } from 'react';
import { css } from '@emotion/react';
import { Loading } from '@/components';
import { postTokenReissue } from '@/apis/auth';
import { AUTH_COOKIE_KEYS } from '@/constants/commons/auth-cookies';
import { useAuthStore } from '@/store/auth';
import { beginAuthRefresh, rejectAuthRefresh, resolveAuthRefresh } from '@/utils/auth-refresh';
import { applyAuthSession, clearClientAuthSession } from '@/utils/auth-session';
import { getCookie } from '@/utils/cookie';

export function AuthBootstrap({ children }: PropsWithChildren) {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);
  const setAuthState = useAuthStore((state) => state.setAuthState);
  const setHasRefreshToken = useAuthStore((state) => state.setHasRefreshToken);

  useEffect(() => {
    let isCancelled = false;

    const bootstrapAuth = async () => {
      const hasRefreshFlag = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
      setHasRefreshToken(hasRefreshFlag);

      if (!hasRefreshFlag) {
        setAuthState('guest');
        setBootstrapped(true);
        return;
      }

      setAuthState('refreshing');
      beginAuthRefresh();

      try {
        const response = await postTokenReissue();
        if (!isCancelled) {
          applyAuthSession(response);
          setHasRefreshToken(true);
        }
        resolveAuthRefresh();
      } catch (error) {
        if (!isCancelled) {
          console.error('[AuthBootstrap] token bootstrap failed', error);
          await clearClientAuthSession();
        }
        rejectAuthRefresh(error);
      } finally {
        if (!isCancelled) {
          setBootstrapped(true);
        }
      }
    };

    if (!isBootstrapped) {
      void bootstrapAuth();
    }

    return () => {
      isCancelled = true;
    };
  }, [isBootstrapped, setAuthState, setBootstrapped, setHasRefreshToken]);

  if (!isBootstrapped) {
    return (
      <div css={loadingWrapper}>
        <Loading fullHeight title="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}

const loadingWrapper = css`
  display: flex;
  min-height: 100vh;
`;
