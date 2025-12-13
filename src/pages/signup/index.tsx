import { useState, useEffect } from 'react';
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

export default function Signup() {
  const router = useRouter();
  const { showToast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const verifyEmailCodeMutation = usePostVerifyEmailCodeMutation();
  const confirmEmailMutation = usePostConfirmEmailMutation();
  const signupMutation = usePostSignupMutation();

  const isLoading =
    verifyEmailCodeMutation.isPending || confirmEmailMutation.isPending || signupMutation.isPending;

  const handleSendEmail = () => {
    // if (!email) {
    //   showToast({ title: 'Please enter your email address', icon: 'exclaim' });
    //   return;
    // }

    verifyEmailCodeMutation.mutate(email, {
      onSuccess: () => {
        setEmailVerified(true);
        showToast({ title: 'Verification code has been sent to your email', icon: 'check' });
      },
      onError: (error: unknown) => {
        const axiosError = error as AxiosError<{ error?: { message?: string } }>;
        const errorMessage =
          axiosError?.response?.data?.error?.message || 'Failed to send verification code';
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
            console.error(
              '❌ [handleConfirmCode] token을 찾을 수 없습니다. response 구조:',
              JSON.stringify(response, null, 2)
            );
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

          // 400 에러는 세션 만료로 간주
          if (status === 400) {
            console.error('[handleConfirmCode] 세션 만료 또는 잘못된 요청:', errorData);

            // 상태 초기화
            setEmailVerified(false);
            setCodeVerified(false);
            setVerificationToken('');
            setVerificationCode('');

            // 세션 만료 메시지 표시
            const sessionExpiredMessage =
              errorMessage.includes('만료') ||
              errorMessage.includes('expired') ||
              errorMessage.includes('세션')
                ? '이메일 인증 세션이 만료되었습니다. 다시 인증 코드를 받아주세요.'
                : errorMessage;

            showToast({ title: sessionExpiredMessage, icon: 'exclaim' });
          } else {
            // 기타 에러
            console.error('❌ [handleConfirmCode] 에러 발생:', errorData);
            showToast({ title: errorMessage, icon: 'exclaim' });
          }
        },
      }
    );
  };

  const handleSignup = () => {
    if (password !== confirmPassword) {
      showToast({ title: 'Passwords do not match', icon: 'exclaim' });
      return;
    }

    if (!verificationToken) {
      console.error('❌ [handleSignup] verificationToken이 없습니다!');
      console.error('❌ [handleSignup] verificationToken 값:', verificationToken);
      showToast({ title: 'Please verify your email first', icon: 'exclaim' });
      return;
    }

    signupMutation.mutate(
      {
        email,
        verification_token: verificationToken,
        password,
        country,
        marketing_consent: false, // TODO: 마케팅 동의 체크박스 추가 시 수정
      },
      {
        onSuccess: (response) => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }

          showToast({ title: 'Account created successfully', icon: 'check' });
          router.push(ROUTES.LOGIN);
        },
        onError: (error: unknown) => {
          const axiosError = error as AxiosError<{ error?: { message?: string } }>;
          const errorMessage =
            axiosError?.response?.data?.error?.message || 'Failed to create account';
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
            Create Account
          </Text>
        </div>

        <div css={content}>
          {/* 회원가입 폼 */}
          <div css={formSection}>
            {/* 이메일 주소 */}
            <div css={inputGroup}>
              <Text typo="body_M" color="text_primary" css={label}>
                Email Address
              </Text>
              <div css={inputWithButton}>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  css={input}
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
              {emailVerified && (
                <Text typo="body_S" color="primary50" css={statusMessage}>
                  * Email verification has been completed.
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
                  placeholder="Enter the code"
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
                  * Authentication completed.
                </Text>
              )}
            </div>

            {/* 비밀번호 */}
            {/* TODO: 유효성 검증 적용 필요 */}
            <div css={inputGroup}>
              <Text typo="body_M" color="text_primary" css={label}>
                Password
              </Text>
              <div css={passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  css={passwordInput}
                />
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
              </div>
              <Text typo="body_S" color="primary50" css={passwordHint}>
                * You can use 8-16 characters, including uppercase and lowercase letters, numbers,
                and special characters.
              </Text>
              <Text typo="body_S" color="primary50" css={passwordHint}>
                * Available special characters (33): $
                {`!"#$%&'()*+,-./:;?@[\]^_${'{'}|\${'}'}\${'~'}`}
              </Text>
            </div>

            {/* TODO: 유효성 검증 적용 필요 */}
            {/* 비밀번호 확인 */}
            <div css={inputGroup}>
              <Text typo="body_M" color="text_primary" css={label}>
                Confirm Password
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
              <Text typo="body_S" color="primary50" css={statusMessage}>
                * Please enter the same password.
              </Text>
            </div>

            {/* 국가 선택 */}
            <div css={inputGroup}>
              <Text typo="body_M" color="text_primary" css={label}>
                Country
              </Text>
              <div css={selectContainer}>
                <select css={select} value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">Select the country</option>
                  <option value="KR">South Korea</option>
                  <option value="US">United States</option>
                  <option value="CN">China</option>
                  <option value="JP">Japan</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <RoundButton
              size="L"
              fullWidth
              onClick={handleSignup}
              disabled={
                isLoading || !email || !password || !confirmPassword || !country || !codeVerified
              }
              css={signupButton}
            >
              <Text typo="button_L" color="white">
                {isLoading ? 'Processing...' : 'Sign up'}
              </Text>
            </RoundButton>

            {/* 로그인 링크 */}
            <div css={loginSection}>
              <Text typo="body_M" color="text_secondary">
                Already have an account?{' '}
              </Text>
              <button type="button" css={linkButton} onClick={() => router.push(ROUTES.LOGIN)}>
                <Text typo="body_M" color="primary50" css={underlineText}>
                  Log in
                </Text>
              </button>
            </div>
          </div>
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

const statusMessage = css`
  margin-top: 8px;
  display: block;
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

const passwordHint = css`
  margin-top: 4px;
  display: block;
  line-height: 1.4;
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
