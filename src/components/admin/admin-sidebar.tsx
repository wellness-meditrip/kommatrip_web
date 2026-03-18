import Link from 'next/link';
import { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { KommaSpaceLogoWhite } from '@/icons';
import { ROUTES } from '@/constants';
import { Text } from '@/components/text';
import { adminConsolePalette } from './admin-console.styles';

interface AdminSidebarProps {
  onLogout: () => void;
  userEmail?: string | null;
}

interface AdminNavItem {
  href: string;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: readonly AdminNavItem[] = [
  { href: ROUTES.ADMIN_DASHBOARD, label: '대시보드', exact: true },
  { href: ROUTES.ADMIN_USERS, label: '회원 관리' },
  { href: ROUTES.ADMIN_COMPANIES, label: '업체 관리' },
  { href: ROUTES.ADMIN_RESERVATIONS, label: '예약 관리' },
  { href: ROUTES.ADMIN_REVIEWS, label: '리뷰 관리' },
];

const normalizePath = (value: string) => {
  if (!value) return '/';
  const [path] = value.split('?');
  if (!path) return '/';
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
};

export function AdminSidebar({ onLogout, userEmail }: AdminSidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = useMemo(() => normalizePath(router.asPath), [router.asPath]);

  const isActive = (item: AdminNavItem) => {
    const target = normalizePath(item.href);
    if (item.exact) return currentPath === target;
    return currentPath === target || currentPath.startsWith(`${target}/`);
  };

  return (
    <aside css={sidebar(collapsed)}>
      <div css={brandRow(collapsed)}>
        <div css={brandText(collapsed)}>
          {!collapsed && <KommaSpaceLogoWhite width="108px" height="28px" />}
        </div>
        <button
          type="button"
          css={collapseButton(collapsed)}
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      <nav css={navList}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} css={navLink(isActive(item), collapsed)}>
            <span css={navDot(isActive(item))} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div css={sidebarFooter}>
        {!collapsed && (
          <div css={accountCard}>
            <Text typo="body12" css={accountLabel}>
              접속 계정
            </Text>
            <Text typo="body10" css={accountValue}>
              {userEmail || '인증 필요'}
            </Text>
          </div>
        )}
        <button type="button" css={logoutButton} onClick={onLogout}>
          {collapsed ? 'OUT' : '로그아웃'}
        </button>
      </div>
    </aside>
  );
}

const sidebar = (collapsed: boolean) => css`
  width: ${collapsed ? '88px' : '264px'};
  min-width: ${collapsed ? '88px' : '264px'};
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 18px 20px;
  background:
    radial-gradient(circle at top left, rgba(132, 155, 130, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(8, 15, 26, 0.98) 0%, rgba(5, 10, 18, 0.98) 100%);
  border-right: 1px solid ${adminConsolePalette.borderSoft};
  transition:
    width 0.2s ease,
    min-width 0.2s ease;
  overflow: hidden;

  @media (max-width: 960px) {
    position: static;
    top: auto;
    align-self: stretch;
    height: auto;
    width: 100%;
    min-width: 100%;
    padding: 16px;
    border-right: none;
    border-bottom: 1px solid ${adminConsolePalette.borderSoft};
    overflow: visible;
  }
`;

const brandRow = (collapsed: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: ${collapsed ? 'center' : 'space-between'};
  gap: 12px;
  min-height: 44px;
`;

const brandText = (collapsed: boolean) => css`
  display: ${collapsed ? 'none' : 'flex'};
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
`;

const collapseButton = (collapsed: boolean) => css`
  border: 1px solid ${adminConsolePalette.borderStrong};
  background: ${adminConsolePalette.surfaceSubtle};
  color: ${adminConsolePalette.textStrong};
  border-radius: 12px;
  width: 36px;
  height: 36px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin: ${collapsed ? '0 auto' : '0'};

  @media (max-width: 960px) {
    display: none;
  }
`;

const navList = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;

  @media (max-width: 960px) {
    flex-direction: row;
    overflow-y: visible;
    overflow-x: auto;
    padding-right: 0;
  }
`;

const navLink = (active: boolean, collapsed: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: ${collapsed ? 'center' : 'flex-start'};
  gap: 12px;
  min-height: 48px;
  padding: ${collapsed ? '0 10px' : '0 14px'};
  border-radius: 16px;
  color: ${active ? adminConsolePalette.textStrong : '#b7c3d7'};
  background: ${active ? 'rgba(132, 155, 130, 0.18)' : 'transparent'};
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;

  &:hover {
    background: ${active ? 'rgba(132, 155, 130, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const navDot = (active: boolean) => css`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${active ? adminConsolePalette.accent : 'rgba(148, 165, 184, 0.4)'};
  flex-shrink: 0;
`;

const sidebarFooter = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${adminConsolePalette.borderSoft};
`;

const accountCard = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const accountLabel = css`
  color: ${adminConsolePalette.textDim};
`;

const accountValue = css`
  color: ${adminConsolePalette.textStrong};
  word-break: break-all;
`;

const logoutButton = css`
  border: 1px solid ${adminConsolePalette.dangerBorder};
  border-radius: 14px;
  min-height: 44px;
  background: ${adminConsolePalette.dangerSoft};
  color: ${adminConsolePalette.dangerText};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;
