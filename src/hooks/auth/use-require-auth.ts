import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store/auth';

/**
 * 인증이 필요한 페이지에서 사용하는 훅
 * 비회원인 경우 로그인 모달을 표시하거나 로그인 페이지로 리다이렉트
 */
export function useRequireAuth(showModal?: boolean) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasUserDismissedModal, setHasUserDismissedModal] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!session?.user || !!accessToken;
  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'loading') return; // 로딩 중이면 대기

    if (!isAuthenticated && !hasUserDismissedModal) {
      if (showModal) {
        // 모달 표시 모드
        setShowLoginModal(true);
      } else {
        // 직접 리다이렉트 모드
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, status, showModal, router, hasUserDismissedModal]);

  const handleDismissModal = () => {
    setShowLoginModal(false);
    setHasUserDismissedModal(true);
  };

  return {
    isAuthenticated,
    isLoading,
    showLoginModal,
    setShowLoginModal,
    handleDismissModal,
  };
}
