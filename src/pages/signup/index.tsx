import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Layout, Text, RoundButton, AppBar } from '@/components';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { DesktopAppBar } from '@/components/desktop-app-bar';
import { useMediaQuery, useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { AxiosError } from 'axios';
import {
  usePostVerifyEmailCodeMutation,
  usePostConfirmEmailMutation,
  usePostSignupMutation,
} from '@/queries/auth';

import { getErrorMessage, isSessionExpiredError } from '@/utils/error-handler';
import { Input } from '@/components/input';
import { useValidateAuthForm } from '@/hooks/auth/use-validate-auth-form';

interface SignupFormData {
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
  country: string;
}

export default function Signup() {
  const router = useRouter();
  const t = useTranslations('auth.signup');
  const tValidation = useTranslations('validation');
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const validation = useValidateAuthForm();

  const verifyEmailCodeMutation = usePostVerifyEmailCodeMutation();
  const confirmEmailMutation = usePostConfirmEmailMutation();
  const signupMutation = usePostSignupMutation();

  const isLoading =
    verifyEmailCodeMutation.isPending || confirmEmailMutation.isPending || signupMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      country: '',
    },
  });

  const email = watch('email');
  const password = watch('password');

  const handleSendEmail = () => {
    if (!email) {
      setError('email', { message: tValidation('email.required') });
      return;
    }

    if (errors.email) {
      showToast({
        title: errors.email.message || tValidation('email.invalid'),
        icon: 'exclaim',
      });
      return;
    }

    verifyEmailCodeMutation.mutate(email, {
      onSuccess: () => {
        setEmailVerified(true);
        showToast({ title: t('verificationCodeSent'), icon: 'check' });
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError;
        const status = axiosError?.response?.status;
        const errorMessage = getErrorMessage(error, t('failedToSendCode'));

        if (status === 400 && (errorMessage.includes('가입') || errorMessage.includes('이미'))) {
          // 이미 가입된 이메일 에러
          setError('email', { message: t('emailAlreadyRegistered') });
        } else {
          // 기타 에러는 토스트만 표시
          showToast({ title: errorMessage, icon: 'exclaim' });
        }
      },
    });
  };

  const handleConfirmCode = () => {
    const verificationCode = watch('verificationCode');

    if (!verificationCode) {
      setError('verificationCode', { message: tValidation('verificationCode.required') });
      showToast({ title: t('pleaseEnterCode'), icon: 'exclaim' });
      return;
    }

    if (!email) {
      showToast({ title: t('pleaseEnterEmailFirst'), icon: 'exclaim' });
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
            console.error(
              '❌ [handleConfirmCode] token을 찾을 수 없습니다. response 구조:',
              JSON.stringify(response, null, 2)
            );
            showToast({ title: t('failedToGetToken'), icon: 'exclaim' });
            return;
          }

          setVerificationToken(token);
          setCodeVerified(true);
          showToast({ title: t('emailVerificationCompleted'), icon: 'check' });
        },
        onError: (error: unknown) => {
          const axiosError = error as AxiosError;
          const status = axiosError?.response?.status;

          if (status === 400 && isSessionExpiredError(error)) {
            // 코드 만료 에러
            setError('verificationCode', { message: t('codeExpired') });
            // 상태 초기화
            setEmailVerified(false);
            setCodeVerified(false);
            setVerificationToken('');
            setValue('verificationCode', '');
          } else if (status === 404) {
            // 인증 요청 없음 에러
            setError('verificationCode', {
              message: t('noVerificationRequest'),
            });
            // 상태 초기화
            setEmailVerified(false);
            setCodeVerified(false);
            setVerificationToken('');
            setValue('verificationCode', '');
          } else {
            // 코드 틀림 에러
            setError('verificationCode', { message: t('invalidCode') });
            const errorMessage = getErrorMessage(error, t('invalidCode'));
            showToast({ title: errorMessage, icon: 'exclaim' });
          }
        },
      }
    );
  };

  const onSubmit = (data: SignupFormData) => {
    if (!verificationToken) {
      showToast({ title: t('pleaseVerifyEmail'), icon: 'exclaim' });
      return;
    }

    signupMutation.mutate(
      {
        email: data.email,
        verification_token: verificationToken,
        password: data.password,
        country: data.country,
        marketing_consent: false, // TODO: 마케팅 동의 체크박스 추가 시 수정
      },
      {
        onSuccess: () => {
          // 회원가입 후에는 accessToken이 제공되지 않을 수 있으므로 로그인 페이지로 이동
          showToast({ title: t('accountCreated'), icon: 'check' });
          router.push(ROUTES.LOGIN);
        },
        onError: (error: unknown) => {
          const errorMessage = getErrorMessage(error, t('failedToCreateAccount'));
          showToast({ title: errorMessage, icon: 'exclaim' });
        },
      }
    );
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
          {/* 회원가입 폼 */}
          <form css={formSection} onSubmit={handleSubmit(onSubmit)}>
            {/* 이메일 주소 */}
            <div css={inputGroup}>
              <div css={inputWithButton}>
                <Input
                  label={t('emailAddress')}
                  type="email"
                  placeholder={t('emailPlaceholder')}
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
                    {t('send')}
                  </Text>
                </RoundButton>
              </div>
              {emailVerified && !errors.email && (
                <Text typo="body_S" color="primary50" css={statusMessage}>
                  * {t('emailVerified')}
                </Text>
              )}
            </div>

            {/* 이메일 인증 코드 */}
            <div css={inputGroup}>
              <div css={inputWithButton}>
                <Input
                  label={t('emailVerificationCode')}
                  type="text"
                  placeholder={t('codePlaceholder')}
                  {...register('verificationCode', { ...validation.verificationCode })}
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
                    {t('confirm')}
                  </Text>
                </RoundButton>
              </div>
              {codeVerified && (
                <Text typo="body_S" color="primary50" css={statusMessage}>
                  * {t('authenticationCompleted')}
                </Text>
              )}
            </div>

            {/* 비밀번호 */}
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

            {/* 비밀번호 확인 */}
            <div css={inputGroup}>
              <Input
                label={t('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                {...register('confirmPassword', {
                  required: tValidation('confirmPassword.required'),
                  validate: (value) => {
                    if (!value) return tValidation('confirmPassword.required');
                    if (value !== password) return tValidation('confirmPassword.mismatch');
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

            {/* 국가 선택 */}
            <div css={inputGroup}>
              <Text typo="body_M" color="text_primary" css={label}>
                {t('country')}
              </Text>
              <div css={selectContainer}>
                <select
                  css={select}
                  {...register('country', { ...validation.country })}
                  aria-invalid={!!errors.country}
                >
                  <option value="">{t('selectCountry')}</option>
                  <option value="KR">{t('southKorea')}</option>
                  <option value="US">{t('unitedStates')}</option>
                  <option value="CN">{t('china')}</option>
                  <option value="JP">{t('japan')}</option>
                  <option value="GB">{t('unitedKingdom')}</option>
                </select>
              </div>
              {errors.country && (
                <Text typo="body_S" color="red200" css={statusMessage}>
                  * {errors.country.message}
                </Text>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <RoundButton
              size="L"
              fullWidth
              type="submit"
              disabled={isLoading || !isValid || !codeVerified}
              css={signupButton}
            >
              <Text typo="button_L" color="white">
                {isLoading ? t('processing') : t('signUpButton')}
              </Text>
            </RoundButton>

            {/* 로그인 링크 */}
            <div css={loginSection}>
              <Text typo="body_M" color="text_secondary">
                {t('alreadyHaveAccount')}{' '}
              </Text>
              <button type="button" css={linkButton} onClick={() => router.push(ROUTES.LOGIN)}>
                <Text typo="body_M" color="primary50" css={underlineText}>
                  {t('logIn')}
                </Text>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

const container = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${theme.colors.bg_default};

  @media (min-width: ${theme.breakpoints.desktop}) {
    flex-direction: row;
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
  align-items: center;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
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
`;

const label = css`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
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

const statusMessage = css`
  margin-top: 8px;
  display: block;
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

const selectContainer = css`
  position: relative;
`;

const select = css`
  width: 100%;
  padding: 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 12px;
  background-color: ${theme.colors.white};
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  color: ${theme.colors.text_primary};
  font-size: 16px;
  font-family: inherit;
  appearance: none;
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  option {
    color: ${theme.colors.text_primary};
  }
`;

const signupButton = css`
  margin-bottom: 24px;
  margin-top: 8px;
`;

const loginSection = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 4px;
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
