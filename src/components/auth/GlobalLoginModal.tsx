import { LoginModal } from '@/components/login-modal';
import { useUiStore } from '@/store/ui';

export function GlobalLoginModal() {
  const { isLoginModalOpen, loginModalCallbackUrl, loginModalDismissRedirectUrl, closeLoginModal } =
    useUiStore();

  return (
    <LoginModal
      isOpen={isLoginModalOpen}
      callbackUrl={loginModalCallbackUrl}
      dismissRedirectUrl={loginModalDismissRedirectUrl}
      onClose={closeLoginModal}
    />
  );
}
