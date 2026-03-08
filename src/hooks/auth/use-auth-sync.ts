import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { deleteCookie, getCookie, setCookie } from '@/utils/cookie';
import { ROUTES } from '@/constants';
import { postTokenReissue } from '@/apis/auth';
import { beginAuthRefresh, rejectAuthRefresh, resolveAuthRefresh } from '@/utils/auth-refresh';

/**
 * NextAuth 세션과 zustand auth store를 동기화하는 훅
 * Google 로그인 성공 시 accessToken을 zustand에 저장하고 refreshToken을 쿠키에 저장
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const refreshAttempted = useRef(false);
  const refreshFromSessionAttempted = useRef(false);

  const parseJwtPayload = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload) as { exp?: number; type?: string };
    } catch {
      return null;
    }
  };

  // Google 로그인 성공 시 토큰 저장
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.accessToken) return;

    // accessToken을 zustand store에 저장
    useAuthStore.getState().setAccessToken(session.accessToken);

    // refreshToken을 쿠키에 저장 (세션에서 가져오기)
    const refreshToken = session.refreshToken;
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, 7); // 7일
    }
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
          deleteCookie('refreshToken');
          rejectAuthRefresh(error);
        });
    }
  }, [session, status]);

  // 이메일 로그인: refreshToken 쿠키가 있으면 accessToken 복원
  useEffect(() => {
    if (status === 'loading') return;
    if (session?.accessToken) return;
    if (refreshAttempted.current) return;

    const hasAccessToken = !!useAuthStore.getState().accessToken;
    const refreshToken = getCookie('refreshToken');
    if (hasAccessToken || !refreshToken) return;

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
        deleteCookie('refreshToken');
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
