import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { deleteCookie, getCookie } from '@/utils/cookie';
import { AUTH_COOKIE_KEYS, ROUTES } from '@/constants';
import { postTokenReissue } from '@/apis/auth';
import { beginAuthRefresh, rejectAuthRefresh, resolveAuthRefresh } from '@/utils/auth-refresh';
import { parseJwtPayload } from '@/utils/auth-token';

/**
 * NextAuth 세션과 zustand auth store를 동기화하는 훅
 * access token 메모리 동기화 및 refresh 재발급 흐름 관리
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const refreshAttempted = useRef(false);
  const refreshFromSessionAttempted = useRef(false);
  const clearRefreshCookies = () => {
    deleteCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch((error) => {
      console.error('[AuthSync] failed to clear refresh cookies', error);
    });
  };

  // 소셜 로그인 성공 시 access token을 메모리 스토어로 동기화
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.accessToken) return;

    useAuthStore.getState().setAccessToken(session.accessToken);
  }, [session, status]);

  // Google 로그인 세션도 accessToken 만료 시 재발급
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.accessToken) return;
    if (refreshFromSessionAttempted.current) return;

    const payload = parseJwtPayload(session.accessToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const isExpired = payload?.exp ? payload.exp <= nowInSeconds + 10 : true;
    const isAccessToken = payload?.type === 'access';

    if (!payload || isExpired || !isAccessToken) {
      refreshFromSessionAttempted.current = true;
      beginAuthRefresh();
      postTokenReissue()
        .then((response) => {
          const newAccessToken = response.tokens.access_token;
          if (newAccessToken) {
            useAuthStore.getState().setAccessToken(newAccessToken);
          }
          resolveAuthRefresh();
        })
        .catch((error) => {
          console.error('[AuthSync] session token reissue failed', error);
          useAuthStore.getState().clearAuth();
          clearRefreshCookies();
          rejectAuthRefresh(error);
        });
    }
  }, [session, status]);

  // 이메일 로그인: refresh marker가 있으면 access token 복원 시도
  useEffect(() => {
    if (status === 'loading') return;
    if (session?.accessToken) return;
    if (refreshAttempted.current) return;

    const hasAccessToken = !!useAuthStore.getState().accessToken;
    const hasRefreshMarker = !!getCookie(AUTH_COOKIE_KEYS.REFRESH_TOKEN_FLAG);
    if (hasAccessToken || !hasRefreshMarker) return;

    refreshAttempted.current = true;
    beginAuthRefresh();
    postTokenReissue()
      .then((response) => {
        const newAccessToken = response.tokens.access_token;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
        }
        resolveAuthRefresh();
      })
      .catch((error) => {
        console.error('[AuthSync] refresh token reissue failed', error);
        useAuthStore.getState().clearAuth();
        clearRefreshCookies();
        rejectAuthRefresh(error);
      });
  }, [session, status]);

  // InterestSetting 확인 및 리다이렉트
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) return;

    // InterestSetting이 false이고, 현재 페이지가 관심사 등록 페이지가 아니면 리다이렉트
    const user = session.user as { InterestSetting?: boolean };
    const skipInterestRedirect =
      typeof window !== 'undefined' && window.sessionStorage.getItem('interest_done') === '1';

    if (user.InterestSetting !== false && skipInterestRedirect) {
      window.sessionStorage.removeItem('interest_done');
    }

    if (
      user.InterestSetting === false &&
      !skipInterestRedirect &&
      router.pathname !== ROUTES.INTEREST
    ) {
      router.push(ROUTES.INTEREST);
    }
  }, [session, status, router]);

  return null;
}
