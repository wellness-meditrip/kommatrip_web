import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { getErrorMessage } from '@/utils/error-handler';
import { Input } from '@/components/input';
import { useValidateAuthForm } from '@/hooks/auth/use-validate-auth-form';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordResetFormData {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
}

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const validation = useValidateAuthForm();

  const resetPasswordRequestMutation = usePostResetPasswordRequestMutation();
  const confirmEmailMutation = usePostResetPasswordConfirmMutation();
  const resetPasswordCompleteMutation = usePostResetPasswordMutation();

  const isLoading =
    resetPasswordRequestMutation.isPending ||
    confirmEmailMutation.isPending ||
    resetPasswordCompleteMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isValid },
    reset,
  } = useForm<PasswordResetFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
    },
  });

  const email = watch('email');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const handleSendEmail = () => {
    if (!email) {
      setError('email', { message: '이메일을 입력해 주세요' });
      showToast({ title: 'Please enter your email address', icon: 'exclaim' });
      return;
    }

    if (errors.email) {
      showToast({
        title: errors.email.message || 'Please enter a valid email address',
        icon: 'exclaim',
      });
      return;
    }

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
    const verificationCode = watch('verificationCode');

    if (!verificationCode) {
      setError('verificationCode', { message: '인증 코드를 입력해 주세요' });
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
            setValue('verificationCode', '');
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

  const onSubmit = (data: PasswordResetFormData) => {
    if (!verificationToken) {
      showToast({ title: 'Please verify your email first', icon: 'exclaim' });
      return;
    }

    resetPasswordCompleteMutation.mutate(
      {
        email: data.email,
        session_token: verificationToken,
        new_password: data.password,
        confirm_password: data.confirmPassword,
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
    reset();
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

        <form css={content} onSubmit={handleSubmit(onSubmit)}>
          {/* 이메일 입력 */}
          <div css={inputGroup}>
            <div css={inputWithButton}>
              <Input
                label="Email"
                type="email"
                placeholder="example@email.com"
                {...register('email', { ...validation.email })}
                errorMessage={errors.email?.message}
              />
              <RoundButton
                size="M"
                type="button"
                onClick={handleSendEmail}
                disabled={isLoading || !email || !!errors.email}
                css={actionButton}
              >
                <Text typo="button_M" color="white">
                  Send
                </Text>
              </RoundButton>
            </div>
          </div>

          {/* 이메일 인증 코드 */}
          <div css={inputGroup}>
            <div css={inputWithButton}>
              <Input
                label="Email Verification Code"
                type="text"
                placeholder="Enter the code..."
                {...register('verificationCode', {
                  required: '인증 코드를 입력해 주세요',
                })}
                errorMessage={errors.verificationCode?.message}
              />
              <RoundButton
                size="M"
                type="button"
                onClick={handleConfirmCode}
                disabled={isLoading || !watch('verificationCode')}
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
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="새 비밀번호를 입력해주세요."
              {...register('password', { ...validation.password })}
              errorMessage={errors.password?.message}
              suffix={
                <button
                  type="button"
                  css={eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                >
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
              }
            />
          </div>

          {/* 비밀번호 확인 */}
          <div css={inputGroup}>
            <Input
              label="Password Confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력해주세요."
              {...register('confirmPassword', {
                required: '비밀번호 확인을 입력해 주세요',
                validate: (value) => {
                  if (!value) return '비밀번호 확인을 입력해 주세요';
                  if (value !== password) return '비밀번호가 일치하지 않아요';
                  return true;
                },
              })}
              errorMessage={errors.confirmPassword?.message}
              suffix={
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
              }
            />
          </div>

          {/* 완료 버튼 */}
          <RoundButton
            size="L"
            fullWidth
            type="submit"
            disabled={isLoading || !isValid || !codeVerified}
            css={submitButton}
          >
            <Text typo="button_L" color="white">
              {isLoading ? 'Processing...' : 'Completed'}
            </Text>
          </RoundButton>
        </form>
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

const inputWithButton = css`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const actionButton = css`
  flex-shrink: 0;
  min-width: 80px;
`;

const eyeButton = css`
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
