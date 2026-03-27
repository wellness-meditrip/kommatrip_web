import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { AppleLogo, GoogleLogo } from '@/icons';
import { ROUTES } from '@/constants';
import { Input } from '@/components/input';
import { Text } from '@/components/text';
import { RoundButton } from '@/components/button';
import { PasswordResetModal } from '@/components/password-reset-modal';
import { useToast } from '@/hooks';
import { useValidateAuthForm } from '@/hooks/auth/use-validate-auth-form';
import { usePostLoginMutation } from '@/queries';
import { theme } from '@/styles';
import { normalizeError } from '@/utils/error-handler';
import { getAuthFeedback } from '@/utils/auth-feedback';
import { applyAuthSession, resolveSafeAuthRedirect } from '@/utils/auth-session';
import { startSocialLogin } from '@/utils/social-auth';

interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormProps {
  callbackUrl?: string;
  variant?: 'page' | 'modal';
  onSuccess?: (redirectUrl: string) => void | Promise<void>;
  onNavigateAway?: () => void;
}

const resolveLoginErrorMessage = (
  error: unknown,
  t: (key: 'loginFailed' | 'prepareLoginFailed') => string
) => {
  const normalized = normalizeError(error);

  if (normalized.status === 400 || normalized.status === 401 || normalized.status === 403) {
    return t('loginFailed');
  }

  if ((normalized.status ?? 0) >= 500) {
    return t('prepareLoginFailed');
  }

  if (
    normalized.message.includes('Request failed with status code') ||
    normalized.message === 'Unexpected error'
  ) {
    return t('prepareLoginFailed');
  }

  return normalized.message || t('prepareLoginFailed');
};

export function LoginForm({
  callbackUrl,
  variant = 'page',
  onSuccess,
  onNavigateAway,
}: LoginFormProps) {
  const router = useRouter();
  const t = useTranslations('auth.login');
  const { showToast } = useToast();
  const validation = useValidateAuthForm();
  const loginMutation = usePostLoginMutation({ suppressGlobalError: true });
  const isLoading = loginMutation.isPending;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [isPreparingSocialLogin, setIsPreparingSocialLogin] = useState(false);
  const [country] = useState('KR');
  const [marketing] = useState(false);

  const resolvedCallbackUrl = resolveSafeAuthRedirect(callbackUrl ?? router.query.callbackUrl);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const finalizeLogin = async (redirectUrl: string) => {
    showToast(getAuthFeedback(t, 'login_success'));

    if (onSuccess) {
      await onSuccess(redirectUrl);
      return;
    }

    await router.replace(redirectUrl);
  };

  const handleEmailLogin = (data: LoginFormData) => {
    clearErrors('root');

    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: async (response) => {
          const isApplied = applyAuthSession(response);

          if (!isApplied) {
            setError('root', { message: t('failedToGetToken') });
            return;
          }

          const redirectUrl =
            response.user.InterestSetting === false ? ROUTES.INTEREST : resolvedCallbackUrl;

          await finalizeLogin(redirectUrl);
        },
        onError: (error: unknown) => {
          setError('root', {
            message: resolveLoginErrorMessage(error, t),
          });
        },
      }
    );
  };

  const beginSocialAuth = (provider: 'google' | 'apple') => {
    clearErrors('root');

    try {
      setIsPreparingSocialLogin(true);
      startSocialLogin({
        provider,
        country,
        marketingConsent: marketing,
        callbackUrl: resolvedCallbackUrl,
      });
    } catch (error) {
      console.error('[LoginForm] failed to start social auth', {
        provider,
        error,
      });
      setIsPreparingSocialLogin(false);
      showToast(getAuthFeedback(t, 'social_login_prepare_failed'));
    }
  };

  const handleSignupNavigation = async () => {
    onNavigateAway?.();
    await router.push(ROUTES.SIGNUP);
  };

  return (
    <>
      <form css={formSection(variant)} onSubmit={handleSubmit(handleEmailLogin)}>
        <div css={inputGroup}>
          <Input
            label={t('email')}
            type="email"
            placeholder={t('emailPlaceholder')}
            {...register('email', { ...validation.email })}
            errorMessage={errors.email?.message}
          />
        </div>

        <div css={inputGroup}>
          <Input
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            {...register('password', {
              required: validation.password.required,
              validate: (value: string) => {
                if (!value) return validation.password.required;
                return true;
              },
            })}
            errorMessage={errors.password?.message}
            suffix={
              <button
                type="button"
                css={eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
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

        <div css={optionsRow}>
          <label css={checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              css={checkbox}
            />
            <Text typo="body_S" color="text_secondary">
              {t('rememberMe')}
            </Text>
          </label>
          <button type="button" css={linkButton} onClick={() => setIsPasswordResetModalOpen(true)}>
            <Text typo="body_S" color="primary50" css={underlineText}>
              {t('findPassword')}
            </Text>
          </button>
        </div>

        {errors.root?.message ? (
          <div css={inlineErrorBox}>
            <Text typo="body_S" color="red200">
              {errors.root.message}
            </Text>
          </div>
        ) : null}

        <RoundButton
          size="L"
          fullWidth
          type="submit"
          disabled={isLoading || !isValid}
          css={loginButton}
        >
          <Text typo="button_L" color="white">
            {isLoading ? t('loggingIn') : t('loginButton')}
          </Text>
        </RoundButton>

        <div css={divider}>
          <div css={dividerLine} />
          <Text typo="body_S" color="text_tertiary" css={dividerText}>
            {t('orContinueWith')}
          </Text>
          <div css={dividerLine} />
        </div>

        <div css={socialButtons}>
          <button
            type="button"
            css={socialButton}
            onClick={() => beginSocialAuth('google')}
            disabled={isPreparingSocialLogin}
          >
            <GoogleLogo width="24px" height="24px" />
          </button>
          <button
            type="button"
            css={socialButton}
            onClick={() => beginSocialAuth('apple')}
            disabled={isPreparingSocialLogin}
          >
            <AppleLogo width="24px" height="24px" />
          </button>
        </div>

        <div css={signupSection}>
          <Text typo="body_M" color="text_secondary">
            {t('noAccount')}
          </Text>
          {variant === 'modal' ? (
            <button type="button" css={modalSignupButton} onClick={handleSignupNavigation}>
              <Text typo="body_M" color="primary50" css={underlineText}>
                {t('signUp')}
              </Text>
            </button>
          ) : (
            <Link href={ROUTES.SIGNUP}>
              <Text typo="body_M" color="primary50" css={underlineText}>
                {t('signUp')}
              </Text>
            </Link>
          )}
        </div>

        <div css={termsSection}>
          <Text typo="body_S" color="text_secondary">
            {t('termsText')}{' '}
          </Text>
          <Text typo="body_S" color="primary50" css={underlineText}>
            <Link
              href="https://www.notion.so/English-ONYU-Terms-of-Use-2958bf64ec2180b69375d5abbb8f8869?source=copy_link"
              target="_blank"
            >
              {t('termsOfUse')}
            </Link>
          </Text>
          <Text typo="body_S" color="text_secondary">
            {' '}
            {t('and')}{' '}
          </Text>
          <Text typo="body_S" color="primary50" css={underlineText}>
            <Link
              href="https://www.notion.so/English-ONYU-Privacy-Policy-2958bf64ec2180b69375d5abbb8f8869?source=copy_link"
              target="_blank"
            >
              {t('privacyPolicy')}
            </Link>
          </Text>
          {t('acknowledge') ? (
            <Text typo="body_S" color="text_secondary">
              {' '}
              {t('acknowledge')}
            </Text>
          ) : null}
        </div>
      </form>

      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
      />
    </>
  );
}

const formSection = (variant: 'page' | 'modal') => css`
  background-color: ${theme.colors.white};
  border-radius: ${variant === 'page' ? '20px 20px 0 0' : '0'};
  padding: ${variant === 'page' ? '32px 24px 40px' : '0 0 8px'};
  margin-top: ${variant === 'page' ? '-20px' : '0'};
  position: relative;
  z-index: 1;
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 100%;
    max-width: 480px;
    border-radius: ${variant === 'page' ? '20px' : '0'};
    padding: ${variant === 'page' ? '48px 40px' : '0'};
    margin-top: 0;
  }
`;

const inputGroup = css`
  margin-bottom: 24px;

  &:last-of-type {
    margin-bottom: 20px;
  }
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

const optionsRow = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const checkboxLabel = css`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const checkbox = css`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.primary50};
`;

const linkButton = css`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const underlineText = css`
  text-decoration: underline;
`;

const inlineErrorBox = css`
  margin-bottom: 16px;
`;

const loginButton = css`
  margin-bottom: 24px;
`;

const divider = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const dividerLine = css`
  flex: 1;
  height: 1px;
  background-color: ${theme.colors.border_default};
`;

const dividerText = css`
  white-space: nowrap;
`;

const socialButtons = css`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    gap: 20px;
  }
`;

const socialButton = css`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid ${theme.colors.border_default};
  background-color: ${theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.bg_default};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const signupSection = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const modalSignupButton = css`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const termsSection = css`
  text-align: center;
  line-height: 1.6;
`;
