import { css } from '@emotion/react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { AdminBackendTargetSelector } from '@/components/admin/admin-backend-target-selector';
import { Text } from '@/components/text';
import { ADMIN_BACKEND_TARGET_LABELS, type AdminBackendTarget } from '@/constants/admin-backend';
import { ROUTES } from '@/constants';
import { useToast } from '@/hooks';
import { useAdminAuth } from '@/hooks/admin/use-admin-auth';
import {
  getStoredAdminBackendTarget,
  isAdminTestBackendEnabled,
  persistAdminBackendTarget,
} from '@/utils/admin-backend-target';
import { adminConsolePalette } from './admin-console.styles';

const resolvePageTitleSegments = (pathname: string) => {
  if (pathname === '/admin') {
    return ['대시보드'];
  }

  if (pathname.includes('/programs')) {
    return ['업체관리', '프로그램 관리'];
  }

  if (pathname.startsWith('/admin/companies') && pathname.includes('/reviews')) {
    return ['리뷰관리', '업체 리뷰'];
  }

  if (pathname.startsWith('/admin/companies')) {
    return ['업체관리'];
  }

  if (pathname.startsWith('/admin/users')) {
    return ['회원관리'];
  }

  if (pathname.startsWith('/admin/reservations')) {
    return ['예약관리'];
  }

  if (pathname.startsWith('/admin/reviews')) {
    return ['리뷰관리'];
  }

  return ['관리자 화면'];
};

export function AdminTopbar() {
  const router = useRouter();
  const { showToast } = useToast();
  const { logout } = useAdminAuth();
  const [backendTarget, setBackendTarget] = useState<AdminBackendTarget>(() =>
    getStoredAdminBackendTarget()
  );
  const [isSwitchingBackend, setIsSwitchingBackend] = useState(false);
  const titleSegments = useMemo(() => resolvePageTitleSegments(router.pathname), [router.pathname]);

  const handleBackendTargetChange = async (nextTarget: AdminBackendTarget) => {
    if (nextTarget === backendTarget || isSwitchingBackend) return;

    setIsSwitchingBackend(true);
    persistAdminBackendTarget(nextTarget);
    setBackendTarget(nextTarget);

    try {
      await logout();
      showToast({
        title: `${ADMIN_BACKEND_TARGET_LABELS[nextTarget]}로 전환되어 다시 로그인해주세요.`,
        icon: 'check',
      });
      await router.replace(
        `${ROUTES.ADMIN_LOGIN}?next=${encodeURIComponent(router.asPath || ROUTES.ADMIN_DASHBOARD)}`
      );
    } finally {
      setIsSwitchingBackend(false);
    }
  };

  return (
    <header css={topbar}>
      <div css={titleBlock}>
        <div css={breadcrumbRow}>
          {titleSegments.map((segment, index) => (
            <div key={`${segment}-${index}`} css={breadcrumbItem}>
              {index > 0 && <span css={separator}>/</span>}
              <Text
                typo={index === titleSegments.length - 1 ? 'title_S' : 'body9'}
                css={titleText(index === titleSegments.length - 1)}
              >
                {segment}
              </Text>
            </div>
          ))}
        </div>
      </div>

      <div css={backendTargetBlock}>
        <AdminBackendTargetSelector
          value={backendTarget}
          onChange={(target) => void handleBackendTargetChange(target)}
          isTestEnabled={isAdminTestBackendEnabled}
          disabled={isSwitchingBackend}
          compact
        />
      </div>
    </header>
  );
}

const topbar = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid ${adminConsolePalette.borderSoft};
  background: rgba(6, 12, 21, 0.82);
  backdrop-filter: blur(18px);

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 16px;
  }
`;

const titleBlock = css`
  display: flex;
  min-width: 0;
`;

const backendTargetBlock = css`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  max-width: 320px;

  @media (max-width: 960px) {
    max-width: none;
  }
`;

const breadcrumbRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const breadcrumbItem = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const separator = css`
  color: ${adminConsolePalette.textDim};
  font-size: 13px;
  font-weight: 700;
`;

const titleText = (isCurrent: boolean) => css`
  color: ${isCurrent ? adminConsolePalette.textStrong : adminConsolePalette.textSubtle};
`;
