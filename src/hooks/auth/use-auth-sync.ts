import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/constants';

/**
 * 사용자 상태를 기준으로 관심사 등록 페이지 리다이렉트를 동기화한다.
 */
export function useAuthSync() {
  const router = useRouter();
  const authState = useAuthStore((state) => state.authState);
  const user = useAuthStore((state) => state.user);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);

  // InterestSetting 확인 및 리다이렉트
  useEffect(() => {
    if (!isBootstrapped) return;
    if (authState !== 'authenticated' || !user) return;

    // InterestSetting이 false이고, 현재 페이지가 관심사 등록 페이지가 아니면 리다이렉트
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
      void router.push(ROUTES.INTEREST);
    }
  }, [authState, isBootstrapped, router, user]);

  return null;
}
