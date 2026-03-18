import { FormEvent, useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import {
  adminAccentButton,
  adminConsolePalette,
  adminGhostButton,
  adminHeroDescription,
  adminHeroTitle,
} from '@/components/admin/admin-console.styles';
import { Input } from '@/components/input';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { useAdminAuth, useToast } from '@/hooks';
import { postAdminLogin, postAdminRegister } from '@/apis';
import { persistAdminAuthFromResponse } from '@/utils/admin-auth-storage';
import { normalizeError } from '@/utils/error-handler';

const resolveNextPath = (nextValue: string | string[] | undefined) => {
  if (Array.isArray(nextValue)) return nextValue[0] ?? ROUTES.ADMIN_DASHBOARD;
  if (typeof nextValue === 'string' && nextValue.startsWith('/')) return nextValue;
  return ROUTES.ADMIN_DASHBOARD;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isReady, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupSecretKey, setSignupSecretKey] = useState('');
  const [signupErrorMessage, setSignupErrorMessage] = useState('');
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);
  const nextPath = useMemo(() => resolveNextPath(router.query.next), [router.query.next]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    void router.replace(nextPath);
  }, [isAuthenticated, isReady, nextPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await postAdminLogin({
        email: email.trim(),
        password,
      });

      persistAdminAuthFromResponse(response);
      showToast({ title: '관리자 로그인에 성공했습니다.', icon: 'check' });
      await router.replace(nextPath);
    } catch (error) {
      const message = normalizeError(error).message || '관리자 로그인에 실패했습니다.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignupErrorMessage('');

    if (
      !signupUsername.trim() ||
      !signupEmail.trim() ||
      !signupPassword.trim() ||
      !signupPasswordConfirm.trim() ||
      !signupSecretKey.trim()
    ) {
      setSignupErrorMessage('회원가입에 필요한 항목을 모두 입력해주세요.');
      return;
    }

    if (signupPassword.length < 8) {
      setSignupErrorMessage('비밀번호는 8자 이상 입력해주세요.');
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignupErrorMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSignupSubmitting(true);

    try {
      const response = await postAdminRegister({
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        admin_secret_key: signupSecretKey.trim(),
      });

      persistAdminAuthFromResponse(response);
      showToast({ title: '관리자 회원가입과 로그인이 완료되었습니다.', icon: 'check' });
      await router.replace(nextPath);
    } catch (error) {
      const message = normalizeError(error).message || '관리자 회원가입에 실패했습니다.';
      setSignupErrorMessage(message);
    } finally {
      setIsSignupSubmitting(false);
    }
  };

  return (
    <div css={loginPage}>
      <div css={loginCard}>
        <div css={titleArea}>
          <Text tag="h1" typo="title1" css={adminHeroTitle}>
            Admin Company Console
          </Text>
          <Text typo="body9" css={adminHeroDescription}>
            업체 등록과 수정은 관리자 토큰으로만 접근합니다.
          </Text>
        </div>

        <form css={formLayout} onSubmit={handleSubmit}>
          <Input
            tone="dark"
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            tone="dark"
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {errorMessage && (
            <Text typo="body9" color="red200">
              {errorMessage}
            </Text>
          )}

          <button type="submit" css={loginButton} disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div css={sectionDivider} />

        <div css={signupSection}>
          <button
            type="button"
            css={signupToggleButton}
            onClick={() => {
              setIsSignupOpen((prev) => !prev);
              setSignupErrorMessage('');
            }}
          >
            {isSignupOpen ? '관리자 회원가입 닫기' : '관리자 회원가입'}
          </button>

          {isSignupOpen && (
            <div css={signupPanel}>
              <div css={signupIntro}>
                <Text typo="subtitle1" css={signupTitle}>
                  관리자 회원가입
                </Text>
                <Text typo="body10" css={signupDescription}>
                  관리자 비밀키가 있어야 가입할 수 있으며, 가입 즉시 관리자 세션이 생성됩니다.
                </Text>
              </div>

              <form css={signupFormLayout} onSubmit={handleSignupSubmit}>
                <Input
                  tone="dark"
                  label="관리자 이름"
                  value={signupUsername}
                  onChange={(event) => setSignupUsername(event.target.value)}
                  required
                />
                <Input
                  tone="dark"
                  label="이메일"
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  required
                />
                <Input
                  tone="dark"
                  label="비밀번호"
                  type="password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  required
                />
                <Input
                  tone="dark"
                  label="비밀번호 확인"
                  type="password"
                  value={signupPasswordConfirm}
                  onChange={(event) => setSignupPasswordConfirm(event.target.value)}
                  required
                />
                <Input
                  tone="dark"
                  label="관리자 비밀키"
                  type="password"
                  value={signupSecretKey}
                  onChange={(event) => setSignupSecretKey(event.target.value)}
                  required
                />

                {signupErrorMessage && (
                  <Text typo="body9" color="red200">
                    {signupErrorMessage}
                  </Text>
                )}

                <button type="submit" css={signupButton} disabled={isSignupSubmitting}>
                  {isSignupSubmitting ? '회원가입 중...' : '관리자 회원가입'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const loginPage = css`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(132, 155, 130, 0.18), transparent 28%),
    radial-gradient(circle at top right, rgba(111, 102, 255, 0.12), transparent 24%),
    linear-gradient(180deg, #0b1422 0%, #050b15 100%);
`;

const loginCard = css`
  width: 100%;
  max-width: 480px;
  padding: 36px;
  border-radius: 28px;
  background: rgba(14, 22, 35, 0.96);
  border: 1px solid ${adminConsolePalette.borderSoft};
  box-shadow: 0 30px 80px rgba(2, 6, 14, 0.3);
`;

const titleArea = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`;

const formLayout = css`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const sectionDivider = css`
  height: 1px;
  margin: 28px 0 22px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(148, 165, 184, 0.24) 18%,
    transparent 100%
  );
`;

const signupSection = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const signupToggleButton = css`
  ${adminGhostButton};
  width: 100%;
  height: 46px;
  border-radius: 14px;
`;

const signupPanel = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const signupIntro = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const signupTitle = css`
  color: ${adminConsolePalette.textStrong};
`;

const signupDescription = css`
  color: ${adminConsolePalette.textSubtle};
`;

const signupFormLayout = css`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const loginButton = css`
  ${adminAccentButton};
  width: 100%;
  border-radius: 16px;
  height: 52px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const signupButton = css`
  ${adminAccentButton};
  width: 100%;
  border-radius: 16px;
  height: 50px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
