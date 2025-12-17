import { useRouter } from 'next/router';
import { Dim, Portal, Text } from '@/components';
import { ROUTES } from '@/constants';
import { css } from '@emotion/react';
import { theme } from '@/styles';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
}

export function LoginModal({ isOpen, onClose, onCancel }: LoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push(ROUTES.LOGIN);
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Portal>
      <Dim fullScreen onClick={handleCancel} />
      <div css={modalWrapper}>
        <div css={iconContainer}>
          <div css={smileyIcon}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="36" stroke={theme.colors.primary50} strokeWidth="3" />
              <circle cx="28" cy="32" r="3.5" fill={theme.colors.primary50} />
              <circle cx="52" cy="32" r="3.5" fill={theme.colors.primary50} />
              <path
                d="M28 50C28 46 32 44 40 44C48 44 52 46 52 50"
                stroke={theme.colors.primary50}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div css={contentContainer}>
          <Text typo="title_M" color="text_primary" css={title}>
            Sign in to continue
          </Text>
          <Text typo="body_M" color="text_secondary" css={description}>
            Create account to unlock curated Korean Wellness Programs
          </Text>
        </div>

        <div css={buttonContainer}>
          <button css={cancelButton} onClick={handleCancel}>
            <Text typo="button_M" color="primary50">
              Cancel
            </Text>
          </button>
          <button css={loginButton} onClick={handleLogin}>
            <Text typo="button_M" color="white">
              Login
            </Text>
          </button>
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

  width: calc(100% - 40px);
  max-width: 400px;
  border-radius: 20px;
  background: ${theme.colors.white};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
`;

const iconContainer = css`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 24px;
`;

const smileyIcon = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
`;

const contentContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 24px 32px;
  text-align: center;
`;

const title = css`
  font-weight: 600;
`;

const description = css`
  line-height: 1.5;
  white-space: pre-line;
`;

const buttonContainer = css`
  display: flex;
  border-top: 1px solid ${theme.colors.border_default};
`;

const cancelButton = css`
  flex: 1;
  padding: 20px 0;
  background: ${theme.colors.white};
  border: none;
  border-right: 1px solid ${theme.colors.border_default};
  border-top: 1px solid ${theme.colors.border_default};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${theme.colors.bg_default};
  }

  &:active {
    background: ${theme.colors.bg_surface1};
  }
`;

const loginButton = css`
  flex: 1;
  padding: 20px 0;
  background: ${theme.colors.primary50};
  border: none;
  border-top: 1px solid ${theme.colors.border_default};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${theme.colors.primary60};
  }

  &:active {
    background: ${theme.colors.primary70};
  }
`;
