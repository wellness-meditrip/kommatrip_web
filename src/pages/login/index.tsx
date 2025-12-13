import { useState } from 'react';
import { Layout, Text, RoundButton, AppBar } from '@/components';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { DesktopAppBar } from '@/components/desktop-app-bar';
import { useMediaQuery } from '@/hooks';
import { ROUTES } from '@/constants';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // TODO: 로그인 API 호출
    console.log('Login:', { email, password, rememberMe });
  };

  const handleGoogleLogin = () => {
    // TODO: Google 로그인 처리
    console.log('Google Login');
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
            Login
          </Text>
        </div>

        <div css={content}>
          {/* 로그인 폼 */}
          <div css={formSection}>
            {/* 이메일 입력 */}
            <div css={inputGroup}>
              <input
                type="email"
                placeholder="Email"
                value={email || ''}
                onChange={(e) => setEmail(e.target.value)}
                css={input}
              />
            </div>

            {/* 비밀번호 입력 */}
            <div css={inputGroup}>
              <div css={passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password"
                  value={password}
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
                  Remember me
                </Text>
              </label>
              <button type="button" css={linkButton} onClick={() => console.log('Find password')}>
                <Text typo="body_S" color="primary50" css={underlineText}>
                  Find password
                </Text>
              </button>
            </div>

            {/* 로그인 버튼 */}
            <RoundButton
              size="L"
              fullWidth
              onClick={handleLogin}
              disabled={!email || !password}
              css={loginButton}
            >
              <Text typo="button_L" color="white">
                Login
              </Text>
            </RoundButton>

            {/* 구분선 */}
            <div css={divider}>
              <div css={dividerLine} />
              <Text typo="body_S" color="text_tertiary" css={dividerText}>
                Or Continue with
              </Text>
              <div css={dividerLine} />
            </div>

            {/* 소셜 로그인 버튼 */}
            <div css={socialButtons}>
              {/* Google 로그인 버튼 */}
              <button type="button" css={socialButton} onClick={handleGoogleLogin}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>

              {/* Apple 로그인 버튼 */}
              <button type="button" css={socialButton} onClick={handleAppleLogin}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </button>
            </div>

            {/* Sign up 링크 */}
            <div css={signupSection}>
              <Text typo="body_M" color="text_secondary">
                Don&apos;t have an account?
              </Text>
              <Link href={ROUTES.SIGNUP}>
                <Text typo="body_M" color="primary50" css={underlineText}>
                  Sign up
                </Text>
              </Link>
            </div>

            {/* Terms of Service */}
            <div css={termsSection}>
              <Text typo="body_S" color="text_secondary">
                $
                {`
                By signing up or logging in, you acknowledge and agree to ONYU's
                <Link href={ROUTES.TERMS_OF_USE}>General Terms of Use</Link>
                <Link href={ROUTES.TERMS_OF_USE}>Privacy Policy</Link>
                `}
              </Text>
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

const input = css`
  width: 100%;
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
`;

const termsSection = css`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-wrap: wrap;
  gap: 4px;
`;
