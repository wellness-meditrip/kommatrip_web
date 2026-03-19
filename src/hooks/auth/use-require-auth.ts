import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { ROUTES } from '@/constants';
import { openLoginModal } from '@/utils/auth-modal';
import { useAuthState } from './use-auth-state';

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 비회원인 경우 로그인 모달을 표시하거나 로그인 페이지로 리다이렉트
 */
export function useRequireAuth(showModal?: boolean) {
  const router = useRouter();
  const { authState, isAuthenticated, isLoading } = useAuthState();
  const promptedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    if (isLoading || showModal) return;
    if (!isAuthenticated) {
      void router.replace({
        pathname: ROUTES.LOGIN,
        query: { callbackUrl: router.asPath },
      });
    }
  }, [isAuthenticated, isLoading, showModal, router, router.asPath, router.isReady]);

  useEffect(() => {
    if (!router.isReady || !showModal || isLoading) return;

    if (isAuthenticated) {
      promptedPathRef.current = null;
      return;
    }

    if (promptedPathRef.current === router.asPath) {
      return;
    }

    promptedPathRef.current = router.asPath;
    openLoginModal({
      callbackUrl: router.asPath,
      dismissRedirectUrl: ROUTES.HOME,
      reason: 'guard',
    });
  }, [isAuthenticated, isLoading, router, router.asPath, router.isReady, showModal]);

  return {
    authState,
    isAuthenticated,
    isLoading,
  };
}
