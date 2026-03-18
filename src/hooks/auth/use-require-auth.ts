import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { useAuthState } from './use-auth-state';

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 비회원인 경우 로그인 모달을 표시하거나 로그인 페이지로 리다이렉트
 */
export function useRequireAuth(showModal?: boolean) {
  const router = useRouter();
  const { authState, isAuthenticated, isLoading } = useAuthState();
  const [hasUserDismissedModal, setHasUserDismissedModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setHasUserDismissedModal(false);
  }, [isAuthenticated]);

  useEffect(() => {
    setHasUserDismissedModal(false);
  }, [router.pathname]);

  useEffect(() => {
    if (isLoading || showModal) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, showModal, router]);

  const setShowLoginModal = useCallback((isOpen: boolean) => {
    setHasUserDismissedModal(!isOpen);
  }, []);

  const handleDismissModal = useCallback(() => {
    setHasUserDismissedModal(true);
  }, []);

  const showLoginModal = Boolean(showModal && authState === 'guest' && !hasUserDismissedModal);

  return {
    authState,
    isAuthenticated,
    isLoading,
    showLoginModal,
    setShowLoginModal,
    handleDismissModal,
  };
}
