import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { Close } from '@/icons';
import { Dim } from '@/components/dim';
import { Portal } from '@/components/portal';
import { Text } from '@/components/text';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthState } from '@/hooks/auth/use-auth-state';
import { theme } from '@/styles';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  callbackUrl?: string;
  dismissRedirectUrl?: string | null;
}

export function LoginModal({
  isOpen,
  onClose,
  onCancel,
  callbackUrl,
  dismissRedirectUrl,
}: LoginModalProps) {
  const router = useRouter();
  const t = useTranslations('auth.loginModal');
  const { isAuthenticated } = useAuthState();

  if (!isOpen) return null;

  const handleClose = async () => {
    onClose();
    onCancel?.();

    if (!dismissRedirectUrl || isAuthenticated) return;
    await router.replace(dismissRedirectUrl);
  };

  return (
    <Portal>
      <Dim fullScreen onClick={() => void handleClose()} />
      <div css={modalWrapper} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        <div css={modalHeader}>
          <div>
            <Text id="login-modal-title" tag="h2" typo="title_L" color="text_primary">
              {t('title')}
            </Text>
            <Text tag="p" typo="body_M" color="text_secondary" css={description}>
              {t('description')}
            </Text>
          </div>
          <button type="button" css={closeButton} onClick={() => void handleClose()}>
            <Close width={18} height={18} />
          </button>
        </div>

        <div css={formWrapper}>
          <LoginForm
            variant="modal"
            callbackUrl={callbackUrl}
            onNavigateAway={onClose}
            onSuccess={async (redirectUrl) => {
              onClose();
              await router.replace(redirectUrl);
            }}
          />
        </div>
      </div>
    </Portal>
  );
}

const modalWrapper = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${theme.zIndex.dialog};

  width: min(520px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow: auto;
  border-radius: 24px;
  background: ${theme.colors.white};
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.2);
`;

const modalHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 20px;
`;

const closeButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: ${theme.colors.bg_surface1};
  cursor: pointer;
  color: ${theme.colors.text_secondary};

  &:hover {
    background: ${theme.colors.bg_default};
  }
`;

const description = css`
  margin-top: 8px;
  line-height: 1.6;
  white-space: pre-line;
`;

const formWrapper = css`
  padding: 0 28px 28px;
`;
