import { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAdminUser } from '@/apis';
import { Loading } from '@/components/common';
import {
  adminCapsuleBadge,
  adminConsolePalette,
  adminEmptyDescription,
  adminEmptyState,
  adminEmptyTitle,
  adminGhostButton,
  adminPage,
  adminSegmentButton,
  adminSegmented,
} from '@/components/admin/admin-console.styles';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { AdminSearchField } from '@/components/admin/common/AdminSearchField';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';
import { Text } from '@/components/text';
import { useAdminAccess, useDialog, useToast } from '@/hooks';
import type { AdminUserListItem, AdminUsersParams } from '@/models';
import { useGetAdminUsersQuery } from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { normalizeError } from '@/utils/error-handler';
import { toSearchableText } from '@/utils/search';

const MARKETING_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'consented', label: '동의만' },
  { value: 'not-consented', label: '미동의만' },
] as const;

type MarketingFilterValue = (typeof MARKETING_FILTERS)[number]['value'];

const ROLE_LABELS: Record<string, string> = {
  customer: '일반 고객',
  company_owner: '업체 관리자',
  company_staff: '업체 직원',
  meditrip_admin: '메디트립 관리자',
};

const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
  noselect: '미입력',
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
  }).format(parsed);
};

const formatRole = (value?: string | null) => {
  if (!value) return '-';
  return ROLE_LABELS[value] ?? value;
};

const formatGender = (value?: string | null) => {
  if (!value) return '';
  return GENDER_LABELS[value] ?? value;
};

const buildUserProfileSummary = (user: AdminUserListItem) => {
  const parts = [user.country ?? '', formatGender(user.gender), user.age_group ?? ''].filter(
    (value) => value.length > 0
  );

  if (parts.length === 0) return '-';
  return parts.join(' · ');
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { canAccess } = useAdminAccess();
  const { open: openDialog } = useDialog();
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [debouncedCountry, setDebouncedCountry] = useState('');
  const [marketingFilter, setMarketingFilter] = useState<MarketingFilterValue>('all');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setDebouncedCountry(countryInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [countryInput, keyword]);

  const queryParams = useMemo<AdminUsersParams>(() => {
    const params: AdminUsersParams = {};

    if (debouncedKeyword) {
      if (debouncedKeyword.includes('@')) {
        params.email = debouncedKeyword;
      } else {
        params.user_name = debouncedKeyword;
      }
    }

    if (debouncedCountry) {
      params.country = debouncedCountry;
    }

    if (marketingFilter === 'consented') {
      params.marketing_consent = true;
    }

    if (marketingFilter === 'not-consented') {
      params.marketing_consent = false;
    }

    return params;
  }, [debouncedCountry, debouncedKeyword, marketingFilter]);

  const usersQuery = useGetAdminUsersQuery(queryParams, canAccess);

  const users = useMemo(() => {
    const list = usersQuery.data?.users ?? [];
    const searchTerm = toSearchableText(debouncedKeyword);

    if (!searchTerm) return list;

    return list.filter((user) => {
      const searchableFields = [
        user.username,
        user.email,
        user.country,
        user.phone,
        formatRole(user.role),
        formatGender(user.gender),
        user.age_group,
        ...(user.topic_interest ?? []),
      ];

      return searchableFields.some((field) => toSearchableText(field).includes(searchTerm));
    });
  }, [debouncedKeyword, usersQuery.data?.users]);

  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter((user) => user.role === 'customer').length;
    const partnerAccounts = users.filter((user) =>
      ['company_owner', 'company_staff', 'meditrip_admin'].includes(user.role)
    ).length;
    const marketingConsented = users.filter((user) => user.marketing_consent).length;

    return {
      total,
      customers,
      partnerAccounts,
      marketingConsented,
    };
  }, [users]);

  const hasActiveFilters =
    debouncedKeyword.length > 0 || debouncedCountry.length > 0 || marketingFilter !== 'all';

  const handleDeleteUser = (user: AdminUserListItem) => {
    openDialog({
      type: 'warn',
      title: `${user.username || user.email || `회원 ${user.id}`} 계정을 삭제할까요?`,
      description: '삭제 후에는 복구 기능이 연결되어 있지 않습니다.',
      primaryActionLabel: '삭제',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        try {
          setDeletingUserId(user.id);
          const response = await deleteAdminUser(user.id);
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.GET_ADMIN_USERS,
          });
          await usersQuery.refetch();
          showToast({
            title: response.message || '회원이 삭제되었습니다.',
            icon: 'check',
          });
        } catch (error) {
          showToast({
            title: normalizeError(error).message || '회원 삭제에 실패했습니다.',
            icon: 'exclaim',
          });
        } finally {
          setDeletingUserId(null);
        }
      },
    });
  };

  if (!canAccess || (usersQuery.isLoading && !usersQuery.data)) {
    return <Loading title="회원관리 화면을 준비하는 중입니다." fullHeight />;
  }

  return (
    <div css={page}>
      <AdminPageHeader
        title="회원관리"
        description="회원 목록을 조회하고 국가와 마케팅 동의 여부로 필터링합니다."
        actions={
          <button
            type="button"
            css={refreshButton}
            onClick={() => {
              void usersQuery.refetch();
            }}
          >
            새로고침
          </button>
        }
      />

      <section css={statsGrid}>
        <AdminStatCard as="div" label="조회 회원" value={stats.total} />
        <AdminStatCard as="div" label="일반 고객" value={stats.customers} />
        <AdminStatCard as="div" label="운영 계정" value={stats.partnerAccounts} />
        <AdminStatCard as="div" label="마케팅 동의" value={stats.marketingConsented} />
      </section>

      <section css={toolbar}>
        <AdminSearchField
          value={keyword}
          onChange={setKeyword}
          placeholder="이메일 또는 사용자명 검색"
          containerCss={searchField}
        />

        <AdminSearchField
          value={countryInput}
          onChange={setCountryInput}
          placeholder="국가명 입력"
          label="국가"
          icon={null}
          containerCss={countryField}
        />

        <div css={marketingSegment}>
          {MARKETING_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              css={adminSegmentButton(marketingFilter === option.value)}
              onClick={() => setMarketingFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section css={resultPanel}>
        <AdminPageHeader
          as="div"
          containerCss={resultPanelHeader}
          title="회원 목록"
          description={
            usersQuery.isFetching
              ? '회원 목록을 업데이트하는 중입니다.'
              : '백엔드 관리자 회원 목록 API 기준'
          }
          actions={
            <Text typo="body9" css={resultCount}>
              총 {users.length}건
            </Text>
          }
        />

        {usersQuery.isError ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              회원 목록을 불러오지 못했습니다.
            </Text>
            <Text typo="body10" css={adminEmptyDescription}>
              {normalizeError(usersQuery.error).message}
            </Text>
          </div>
        ) : users.length === 0 ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              {hasActiveFilters ? '조건에 맞는 회원이 없습니다.' : '등록된 회원이 없습니다.'}
            </Text>
            <Text typo="body10" css={adminEmptyDescription}>
              {hasActiveFilters
                ? '검색어 또는 필터 조건을 조정한 뒤 다시 조회해 주세요.'
                : '백엔드에 회원 데이터가 등록되면 이 목록에 표시됩니다.'}
            </Text>
          </div>
        ) : (
          <div css={tableWrap}>
            <table css={table}>
              <thead>
                <tr>
                  <th>사용자명</th>
                  <th>이메일</th>
                  <th>프로필</th>
                  <th>역할</th>
                  <th>연락처</th>
                  <th>마케팅</th>
                  <th>가입일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div css={identityCell}>
                        <Text typo="body9" css={primaryCellText}>
                          {user.username || '-'}
                        </Text>
                        <Text typo="body11" css={secondaryCellText}>
                          ID {user.id}
                        </Text>
                      </div>
                    </td>
                    <td>
                      <Text typo="body10" css={primaryCellText}>
                        {user.email || '-'}
                      </Text>
                    </td>
                    <td>
                      <Text typo="body10" css={secondaryCellText}>
                        {buildUserProfileSummary(user)}
                      </Text>
                    </td>
                    <td>
                      <span css={roleChip(user.role)}>{formatRole(user.role)}</span>
                    </td>
                    <td>
                      <Text typo="body10" css={secondaryCellText}>
                        {user.phone || '-'}
                      </Text>
                    </td>
                    <td>
                      <span css={consentChip(user.marketing_consent)}>
                        {user.marketing_consent ? '동의' : '미동의'}
                      </span>
                    </td>
                    <td>
                      <Text typo="body10" css={secondaryCellText}>
                        {formatDate(user.created_at)}
                      </Text>
                    </td>
                    <td>
                      <div css={rowActions}>
                        <AdminActionButton
                          variant="danger"
                          disabled={deletingUserId === user.id}
                          onClick={() => handleDeleteUser(user)}
                        >
                          {deletingUserId === user.id ? '삭제 중...' : '삭제'}
                        </AdminActionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const page = adminPage;

const refreshButton = adminGhostButton;

const statsGrid = css`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const toolbar = css`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const searchField = css`
  flex: 1 1 360px;
  min-width: min(100%, 280px);
`;

const countryField = css`
  flex: 0 1 220px;
  min-width: min(100%, 200px);
`;

const marketingSegment = css`
  ${adminSegmented};
`;

const resultPanel = css`
  border-radius: 28px;
  background: rgba(7, 13, 23, 0.94);
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(2, 6, 14, 0.24);
`;

const resultPanelHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid ${adminConsolePalette.borderSoft};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const resultCount = css`
  color: #9dadc4;
`;

const tableWrap = css`
  width: 100%;
  overflow-x: auto;
`;

const table = css`
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;

  thead tr {
    background: rgba(21, 31, 48, 0.96);
  }

  th {
    padding: 18px 20px;
    text-align: left;
    color: #95a4bb;
    font-size: 14px;
    font-weight: 700;
    border-bottom: 1px solid rgba(142, 164, 190, 0.12);
  }

  td {
    padding: 18px 20px;
    border-bottom: 1px solid rgba(142, 164, 190, 0.08);
    vertical-align: middle;
  }

  tbody tr {
    transition: background 0.16s ease;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const identityCell = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const rowActions = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const primaryCellText = css`
  color: ${adminConsolePalette.textStrong};
`;

const secondaryCellText = css`
  color: ${adminConsolePalette.textSubtle};
`;

const roleChip = (role: string) => css`
  ${adminCapsuleBadge({
    background:
      role === 'meditrip_admin'
        ? adminConsolePalette.infoSoft
        : role === 'customer'
          ? adminConsolePalette.surfaceSubtle
          : adminConsolePalette.accentSoft,
    color:
      role === 'meditrip_admin'
        ? adminConsolePalette.infoText
        : role === 'customer'
          ? adminConsolePalette.textStrong
          : adminConsolePalette.accentText,
  })};
`;

const consentChip = (consented: boolean) => css`
  ${adminCapsuleBadge({
    background: consented ? adminConsolePalette.accentSoft : adminConsolePalette.warningSoft,
    color: consented ? adminConsolePalette.accentText : adminConsolePalette.warningText,
  })};
`;
