import { ReactNode } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { useToast } from '@/hooks';
import { ROUTES } from '@/constants';
import { useAdminAuth } from '@/hooks/admin/use-admin-auth';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { adminConsolePalette } from './admin-console.styles';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { logout, user, isReady } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    showToast({ title: '관리자 로그아웃이 완료되었습니다.', icon: 'check' });
    await router.replace(ROUTES.ADMIN_LOGIN);
  };

  return (
    <div css={shell}>
      <AdminSidebar
        onLogout={() => void handleLogout()}
        userEmail={user?.email}
        showAccount={isReady}
      />
      <div css={mainPane}>
        <AdminTopbar />
        <main css={contentArea} data-admin-content-area>
          <div css={contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}

const shell = css`
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(circle at top left, rgba(132, 155, 130, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(111, 102, 255, 0.08), transparent 22%),
    linear-gradient(
      180deg,
      ${adminConsolePalette.pageTop} 0%,
      ${adminConsolePalette.pageBottom} 100%
    );

  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const mainPane = css`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const contentArea = css`
  flex: 1;
  padding: 24px;

  @media (max-width: 960px) {
    padding: 16px;
  }
`;

const contentInner = css`
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: ${adminConsolePalette.textStrong};
`;
