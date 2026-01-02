import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Layout, Text, RoundButton, AppBar } from '@/components';
import { PasswordResetModal } from '@/components/password-reset-modal';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { DesktopAppBar } from '@/components/desktop-app-bar';
import { useMediaQuery, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import Link from 'next/link';
import { AppleLogo, GoogleLogo } from '@/icons';
import { usePostLoginMutation } from '@/queries';
import { getLocalizedErrorMessage } from '@/utils/error-handler';
import { Input } from '@/components/input';
import { useValidateAuthForm } from '@/hooks/auth/use-validate-auth-form';
import { useAuthStore } from '@/store/auth';
import { setCookie } from '@/utils/cookie';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('auth.login');
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const loginMutation = usePostLoginMutation();
  const isLoading = loginMutation.isPending;
  const validation = useValidateAuthForm();
  const [country] = useState('KR');
  const [marketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasHandledError = useRef(false);
  const hasRedirected = useRef(false);

  // NextAuth 에러 처리 및 세션 확인
  useEffect(() => {
    // 이미 처리했거나 리다이렉트했으면 무시
    if (hasRedirected.current) return;

    const { error, callbackUrl } = router.query;

    // 세션이 있고 에러가 없으면 리다이렉트
    if (status === 'authenticated' && session && !error) {
      hasRedirected.current = true;
      const redirectUrl = typeof callbackUrl === 'string' ? callbackUrl : ROUTES.HOME;
      router.push(redirectUrl);
      return;
    }

    // 에러가 있으면 처리 (한 번만)
    if (error === 'Callback' && !hasHandledError.current) {
      hasHandledError.current = true;

      // 세션이 있으면 성공으로 간주하고 리다이렉트
      if (status === 'authenticated' && session?.accessToken) {
        console.log('[Login] Google login succeeded despite callback error', {
          hasSession: !!session,
          hasAccessToken: !!session?.accessToken,
        });
        hasRedirected.current = true;
        const redirectUrl = typeof callbackUrl === 'string' ? callbackUrl : ROUTES.HOME;
        router.replace(redirectUrl);
      } else if (status === 'unauthenticated') {
        // 실제 에러인 경우 (한 번만 로그)
        console.error('[Login] Google login callback error', { error, status });
        showToast({
          title: t('loginFailed'),
          icon: 'exclaim',
        });
        // 에러 쿼리 파라미터 제거
        const newQuery = { ...router.query };
        delete newQuery.error;
        delete newQuery.callbackUrl;
        router.replace(
          {
            pathname: router.pathname,
            query: newQuery,
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }, [router, status, session, showToast, t]);

  const onGoogle = async () => {
    setLoading(true);

    // 1) 리다이렉트 전에 메타를 httpOnly 쿠키로 저장
    const r = await fetch('/api/auth/google-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country, marketing_consent: marketing }),
    });

    if (!r.ok) {
      setLoading(false);
      showToast({ title: t('prepareLoginFailed'), icon: 'exclaim' });
      return;
    }

    // 2) 구글 로그인 시작
    await signIn('google', { callbackUrl: ROUTES.HOME });
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // email과 password는 form validation에서 자동으로 처리됨

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: (response) => {
          const accessToken = response?.tokens?.access_token;
          const refreshToken = response?.tokens?.refresh_token;

          if (accessToken) {
            console.log('[Login] Email login success - storing tokens', {
              hasAccessToken: !!accessToken,
              accessTokenLength: accessToken.length,
              hasRefreshToken: !!refreshToken,
            });

            // accessToken을 zustand store에 저장 (메모리)
            useAuthStore.getState().setAccessToken(accessToken);
            console.log('[Login] accessToken stored in zustand store');

            // refreshToken을 쿠키에 저장
            if (refreshToken) {
              setCookie('refreshToken', refreshToken, 7); // 7일
              console.log('[Login] refreshToken stored in cookie');
            }

            showToast({ title: t('loginSuccessful'), icon: 'check' });

            // InterestSetting이 false이면 관심사 등록 페이지로 리다이렉트
            if (response?.user && !response.user.InterestSetting) {
              router.push(ROUTES.INTEREST);
            } else {
              router.push(ROUTES.HOME);
            }
          } else {
            showToast({ title: t('failedToGetToken'), icon: 'exclaim' });
          }
        },
        onError: (error: unknown) => {
          const errorMessage = getLocalizedErrorMessage(error, t('loginFailed'));
          showToast({ title: errorMessage, icon: 'exclaim' });
        },
      }
    );
  };

  const handleGoogleLogin = () => {
    onGoogle();
  };

  const handleAppleLogin = () => {
    // TODO: Apple 로그인 처리
    console.log('Apple Login');
  };

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };

  const handleSearch = () => {
    const query = inputValue.trim() ? `?q=${encodeURIComponent(inputValue)}` : '';
    router.push(`${ROUTES.SEARCH}${query}`);
  };
  return (
    <Layout isAppBarExist={false}>
      {isDesktop ? (
        <DesktopAppBar onSearchChange={handleValueChange} onSearch={handleSearch} />
      ) : (
        <AppBar leftButton={true} buttonType="dark" onBackClick={() => router.back()} logo="dark" />
      )}
      <div css={container}>
        {/* 상단 그라데이션 배경 (모바일) */}
        <div css={gradientHeader}>
          <Text typo="title_XL" color="text_primary">
            {t('title')}
          </Text>
        </div>

        <div css={content}>
          {/* 로그인 폼 */}
          <form css={formSection} onSubmit={handleSubmit(onSubmit)}>
            {/* 이메일 입력 */}
            <div css={inputGroup}>
              <Input
                label={t('email')}
                type="email"
                placeholder={t('emailPlaceholder')}
                {...register('email', { ...validation.email })}
                errorMessage={errors.email?.message}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div css={inputGroup}>
              <Input
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholder')}
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

            {/* Remember me & Find password */}
            <div css={optionsRow}>
              <label css={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  css={checkbox}
                />
                <Text typo="body_S" color="text_secondary">
                  {t('rememberMe')}
                </Text>
              </label>
              <button
                type="button"
                css={linkButton}
                onClick={() => setIsPasswordResetModalOpen(true)}
              >
                <Text typo="body_S" color="primary50" css={underlineText}>
                  {t('findPassword')}
                </Text>
              </button>
            </div>

            {/* 로그인 버튼 */}
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

            {/* 구분선 */}
            <div css={divider}>
              <div css={dividerLine} />
              <Text typo="body_S" color="text_tertiary" css={dividerText}>
                {t('orContinueWith')}
              </Text>
              <div css={dividerLine} />
            </div>

            {/* 소셜 로그인 버튼 */}
            <div css={socialButtons}>
              {/* Google 로그인 버튼 */}
              <button
                type="button"
                css={socialButton}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <GoogleLogo width="24px" height="24px" />
              </button>

              {/* Apple 로그인 버튼 */}
              <button type="button" css={socialButton} onClick={handleAppleLogin}>
                <AppleLogo width="24px" height="24px" />
              </button>
            </div>

            {/* Sign up 링크 */}
            <div css={signupSection}>
              <Text typo="body_M" color="text_secondary">
                {t('noAccount')}
              </Text>
              <Link href={ROUTES.SIGNUP}>
                <Text typo="body_M" color="primary50" css={underlineText}>
                  {t('signUp')}
                </Text>
              </Link>
            </div>

            {/* Terms of Service */}
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
              {t('acknowledge') && (
                <Text typo="body_S" color="text_secondary">
                  {' '}
                  {t('acknowledge')}
                </Text>
              )}
            </div>
          </form>
        </div>
      </div>
      <PasswordResetModal
        isOpen={isPasswordResetModalOpen}
        onClose={() => setIsPasswordResetModalOpen(false)}
      />
    </Layout>
  );
}

const container = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${theme.colors.bg_default};

  @media (min-width: ${theme.breakpoints.desktop}) {
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
`;

const gradientHeader = css`
  position: relative;
  width: 100%;
  padding: 60px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const content = css`
  width: 100%;
  padding: 0 20px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 480px;
    max-width: 480px;
    padding: 0;
    flex: 0 0 480px;
  }
`;

const formSection = css`
  background-color: ${theme.colors.white};
  border-radius: 20px 20px 0 0;
  padding: 32px 24px 40px;
  margin-top: -20px;
  position: relative;
  z-index: 1;
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 480px;
    max-width: 480px;
    border-radius: 20px;
    padding: 48px 40px;
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
  margin-bottom: 32px;
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
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`;

const underlineText = css`
  text-decoration: underline;
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
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
    background-color: ${theme.colors.bg_default};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const signupSection = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 24px;
`;

const termsSection = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 4px;
`;
