import { useState, useEffect } from 'react';
import { Text, RoundButton } from '@/components';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { useToast } from '@/hooks';
import { AxiosError } from 'axios';
import {
  usePostResetPasswordRequestMutation,
  usePostResetPasswordConfirmMutation,
  usePostResetPasswordMutation,
} from '@/queries/auth';
import { validateEmail, validatePassword, validatePasswordMatch } from '@/utils/validation';
import { getErrorMessage } from '@/utils/error-handler';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');

  const resetPasswordRequestMutation = usePostResetPasswordRequestMutation();
  const confirmEmailMutation = usePostResetPasswordConfirmMutation();
  const resetPasswordCompleteMutation = usePostResetPasswordMutation();

  const isLoading =
    resetPasswordRequestMutation.isPending ||
    confirmEmailMutation.isPending ||
    resetPasswordCompleteMutation.isPending;

  const handleSendEmail = () => {
    if (!email) {
      setEmailError('Please enter your email address');
      showToast({ title: 'Please enter your email address', icon: 'exclaim' });
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      showToast({ title: 'Please enter a valid email address', icon: 'exclaim' });
      return;
    }

    setEmailError('');
    resetPasswordRequestMutation.mutate(email, {
      onSuccess: () => {
        setEmailVerified(true);
        showToast({ title: 'Verification code has been sent to your email', icon: 'check' });
      },
      onError: (error: unknown) => {
        const errorMessage = getErrorMessage(error, 'Failed to send verification code');
        showToast({ title: errorMessage, icon: 'exclaim' });
      },
    });
  };

  const handleConfirmCode = () => {
    if (!verificationCode) {
      showToast({ title: 'Please enter the verification code', icon: 'exclaim' });
      return;
    }

    if (!email) {
      showToast({ title: 'Please enter your email address first', icon: 'exclaim' });
      return;
    }

    confirmEmailMutation.mutate(
      {
        email,
        code: verificationCode,
      },
      {
        onSuccess: (response) => {
          const token = response?.session_token;
          if (!token) {
            showToast({ title: 'Failed to get verification token', icon: 'exclaim' });
            return;
          }
          setVerificationToken(token);
          setCodeVerified(true);
          showToast({ title: 'Email verification completed', icon: 'check' });
        },
        onError: (error: unknown) => {
          const axiosError = error as AxiosError<{
            error?: { message?: string };
            message?: string;
          }>;
          const status = axiosError?.response?.status;
          const errorData = axiosError?.response?.data;
          const errorMessage =
            errorData?.error?.message || errorData?.message || 'Invalid verification code';

          if (status === 400) {
            setEmailVerified(false);
            setCodeVerified(false);
            setVerificationToken('');
            setVerificationCode('');
            const sessionExpiredMessage =
              errorMessage.includes('만료') ||
              errorMessage.includes('expired') ||
              errorMessage.includes('세션')
                ? '이메일 인증 세션이 만료되었습니다. 다시 인증 코드를 받아주세요.'
                : errorMessage;
            showToast({ title: sessionExpiredMessage, icon: 'exclaim' });
          } else {
            showToast({ title: errorMessage, icon: 'exclaim' });
          }
        },
      }
    );
  };

  const handleResetPassword = () => {
    if (password !== confirmPassword) {
      showToast({ title: 'Passwords do not match', icon: 'exclaim' });
      return;
    }

    if (!verificationToken) {
      showToast({ title: 'Please verify your email first', icon: 'exclaim' });
      return;
    }

    if (!email) {
      showToast({ title: 'Please enter your email address', icon: 'exclaim' });
      return;
    }

    resetPasswordCompleteMutation.mutate(
      {
        email,
        session_token: verificationToken,
        new_password: password,
        confirm_password: confirmPassword,
      },
      {
        onSuccess: (response) => {
          showToast({
            title: response?.message || 'Password has been reset successfully',
            icon: 'check',
          });
          handleClose();
        },
        onError: (error: unknown) => {
          const errorMessage = getErrorMessage(
            error,
            'Failed to reset password. Please try again.'
          );
          showToast({ title: errorMessage, icon: 'exclaim' });
        },
      }
    );
  };

  const handleClose = () => {
    // 상태 초기화
    setEmail('');
    setVerificationCode('');
    setPassword('');
    setConfirmPassword('');
    setEmailVerified(false);
    setCodeVerified(false);
    setVerificationToken('');
    onClose();
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div css={overlay} onClick={handleClose} aria-label="Close modal" />
      <div css={modal} role="dialog" aria-modal="true" aria-labelledby="password-reset-title">
        <div css={header}>
          <Text typo="title_L" color="text_primary" id="password-reset-title">
            Password Change
          </Text>
          <button
            type="button"
            css={closeButton}
            onClick={handleClose}
            aria-label="Close password reset modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke={theme.colors.text_primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div css={content}>
          {/* 이메일 입력 */}
          <div css={inputGroup}>
            <Text typo="body_M" color="text_primary" css={label}>
              Email
            </Text>
            <div css={inputWithButton}>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                css={input}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              <RoundButton
                size="M"
                onClick={handleSendEmail}
                disabled={isLoading || !email}
                css={actionButton}
              >
                <Text typo="button_M" color="white">
                  Send
                </Text>
              </RoundButton>
            </div>
            {emailError && (
              <Text typo="body_S" color="red200" css={statusMessage} id="email-error">
                * {emailError}
              </Text>
            )}
          </div>

          {/* 이메일 인증 코드 */}
          <div css={inputGroup}>
            <Text typo="body_M" color="text_primary" css={label}>
              Email Verification Code
            </Text>
            <div css={inputWithButton}>
              <input
                type="text"
                placeholder="Enter the code..."
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                css={input}
              />
              <RoundButton
                size="M"
                onClick={handleConfirmCode}
                disabled={isLoading || !verificationCode}
                css={actionButton}
              >
                <Text typo="button_M" color="white">
                  Confirm
                </Text>
              </RoundButton>
            </div>
            {codeVerified && (
              <Text typo="body_S" color="primary50" css={statusMessage}>
                * Verified!
              </Text>
            )}
          </div>

          {/* 비밀번호 */}
          <div css={inputGroup}>
            <Text typo="body_M" color="text_primary" css={label}>
              Password
            </Text>
            <div css={passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                css={passwordInput}
                aria-invalid={passwordErrors.length > 0}
                aria-describedby={passwordErrors.length > 0 ? 'password-errors' : undefined}
              />
              <button type="button" css={eyeButton} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                      fill={theme.colors.text_tertiary}
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                      fill={theme.colors.text_tertiary}
                    />
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <div id="password-errors">
                {passwordErrors.map((error, index) => (
                  <Text key={index} typo="body_S" color="red200" css={statusMessage}>
                    * {error}
                  </Text>
                ))}
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div css={inputGroup}>
            <Text typo="body_M" color="text_primary" css={label}>
              Password Confirm
            </Text>
            <div css={passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                css={passwordInput}
              />
              <button
                type="button"
                css={eyeButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                      fill={theme.colors.text_tertiary}
                    />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                      fill={theme.colors.text_tertiary}
                    />
                  </svg>
                )}
              </button>
            </div>
            {password && confirmPassword && !validatePasswordMatch(password, confirmPassword) && (
              <Text typo="body_S" color="red200" css={statusMessage}>
                * Passwords do not match.
              </Text>
            )}
            {(!password ||
              !confirmPassword ||
              validatePasswordMatch(password, confirmPassword)) && (
              <Text typo="body_S" color="primary50" css={statusMessage}>
                * Please enter the same password.
              </Text>
            )}
          </div>

          {/* 완료 버튼 */}
          <RoundButton
            size="L"
            fullWidth
            onClick={handleResetPassword}
            disabled={isLoading || !email || !password || !confirmPassword || !codeVerified}
            css={submitButton}
          >
            <Text typo="button_L" color="white">
              {isLoading ? 'Processing...' : 'Completed'}
            </Text>
          </RoundButton>
        </div>
      </div>
    </>
  );
}

const overlay = css`
  position: fixed;
  inset: 0;
  z-index: 1000;
  max-width: 480px;
  margin: 0 auto;
  background-color: rgb(0 0 0 / 50%);
`;

const modal = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: 90%;
  max-width: 480px;
  padding: 24px;
  border-radius: 20px;
  background-color: ${theme.colors.white};
  max-height: 90vh;
  overflow-y: auto;
`;

const header = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const closeButton = css`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  &:hover {
    opacity: 0.7;
  }
`;

const content = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const inputGroup = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const label = css`
  font-weight: 600;
`;

const inputWithButton = css`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const input = css`
  flex: 1;
  padding: 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 12px;
  background-color: ${theme.colors.white};
  color: ${theme.colors.text_primary};
  font-size: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: ${theme.colors.text_tertiary};
  }

  &:focus {
    border-color: ${theme.colors.primary50};
  }
`;

const actionButton = css`
  flex-shrink: 0;
  min-width: 80px;
`;

const passwordWrapper = css`
  position: relative;
  display: flex;
  align-items: center;
`;

const passwordInput = css`
  width: 100%;
  padding: 16px 50px 16px 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 12px;
  background-color: ${theme.colors.white};
  color: ${theme.colors.text_primary};
  font-size: 16px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: ${theme.colors.text_tertiary};
  }

  &:focus {
    border-color: ${theme.colors.primary50};
  }
`;

const eyeButton = css`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const statusMessage = css`
  margin-top: 4px;
  display: block;
`;

const submitButton = css`
  margin-top: 8px;
`;
