import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { setCookie } from '@/utils/cookie';
import { ROUTES } from '@/constants';

/**
 * NextAuth 세션과 zustand auth store를 동기화하는 훅
 * Google 로그인 성공 시 accessToken을 zustand에 저장하고 refreshToken을 쿠키에 저장
 */
export function useAuthSync() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // InterestSetting 확인 및 리다이렉트
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) return;

    // InterestSetting이 false이고, 현재 페이지가 관심사 등록 페이지가 아니면 리다이렉트
    const user = session.user as { InterestSetting?: boolean };
    if (user.InterestSetting === false && router.pathname !== ROUTES.INTEREST) {
      router.push(ROUTES.INTEREST);
    }
  }, [session, status, router]);

  return null;
}
