import dynamic from 'next/dynamic';
import { css } from '@emotion/react';
import { Text } from '@/components/text';
import { theme } from '@/styles';
import type { LoginFormProps } from '@/components/auth/LoginForm';

const LoginForm = dynamic(
  () => import('@/components/auth/LoginForm').then((mod) => mod.LoginForm),
  {
    ssr: false,
    loading: () => (
      <div css={loadingWrapper}>
        <Text typo="body_M" color="text_secondary">
          Loading...
        </Text>
      </div>
    ),
  }
);

export function LazyLoginForm(props: LoginFormProps) {
  return <LoginForm {...props} />;
}

const loadingWrapper = css`
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: ${theme.colors.bg_surface1};
`;
