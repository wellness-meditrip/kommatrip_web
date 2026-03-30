import Link from 'next/link';
import { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  adminCompactHeader,
  adminCompactHeaderActions,
  adminCompactHeaderCopy,
  adminInlineDangerButton,
  adminInlineGhostButton,
  adminSectionSubtitle,
  adminSectionTitle,
} from '@/components/admin/admin-console.styles';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { AdminCompanyFormPage } from '@/components/admin/company-form-page';
import { Loading } from '@/components/common';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { useAdminAccess, useDialog, useToast } from '@/hooks';
import { deleteAdminCompany, postAdminCompanyApprove, postAdminCompanySuspend } from '@/apis';
import type { AdminCompanyListItem } from '@/models';
import { useGetAdminCompaniesQuery } from '@/queries';
import { QUERY_KEYS } from '@/queries/query-keys';
import { colors } from '@/styles';
import { normalizeError } from '@/utils/error-handler';
import { toSearchableText } from '@/utils/search';

type CompanyStatusTab = 'all' | 'active' | 'pending' | 'suspended';
type CompanyViewMode = 'table' | 'card';

interface CompanyRow extends AdminCompanyListItem {
  status: Exclude<CompanyStatusTab, 'all'>;
}

const STATUS_META: Array<{ value: CompanyStatusTab; label: string }> = [
  { value: 'active', label: '활성 업체' },
  { value: 'pending', label: '승인 대기' },
  { value: 'suspended', label: '중지 업체' },
  { value: 'all', label: '전체' },
];

const STATUS_LABELS: Record<Exclude<CompanyStatusTab, 'all'>, string> = {
  active: '활성',
  pending: '승인 대기',
  suspended: '중지',
};

const VIEW_OPTIONS: Array<{ value: CompanyViewMode; label: string }> = [
  { value: 'table', label: '표형' },
  { value: 'card', label: '카드형' },
];

const withStatus = (
  companies: AdminCompanyListItem[] | undefined,
  status: Exclude<CompanyStatusTab, 'all'>
): CompanyRow[] => (companies ?? []).map((company) => ({ ...company, status }));

const dedupeCompanies = (companies: CompanyRow[]) => {
  const byId = new Map<number, CompanyRow>();
  for (const company of companies) {
    if (!byId.has(company.id)) {
      byId.set(company.id, company);
    }
  }
  return Array.from(byId.values());
};

const filterCompaniesByKeyword = (companies: CompanyRow[], keyword: string) => {
  const searchTerm = toSearchableText(keyword);
  if (!searchTerm) return companies;

  return companies.filter((company) => {
    const searchFields = [company.name, company.address, company.simpleplace ?? ''];

    return searchFields.some((field) => toSearchableText(field).includes(searchTerm));
  });
};

const isPendingCompany = (company: CompanyRow) => company.status === 'pending';
const canOpenPrograms = (company: CompanyRow) => company.status !== 'suspended';

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const { canAccess } = useAdminAccess();
  const { showToast } = useToast();
  const { open: openDialog } = useDialog();

  const [statusTab, setStatusTab] = useState<CompanyStatusTab>('active');
  const [viewMode, setViewMode] = useState<CompanyViewMode>('table');
  const [keyword, setKeyword] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isStatusUpdatingId, setIsStatusUpdatingId] = useState<number | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

  const activeCompaniesQuery = useGetAdminCompaniesQuery('active', canAccess);
  const pendingCompaniesQuery = useGetAdminCompaniesQuery('pending', canAccess);
  const suspendedCompaniesQuery = useGetAdminCompaniesQuery('suspended', canAccess);

  const companyBuckets = useMemo(
    () => ({
      active: withStatus(activeCompaniesQuery.data?.companies, 'active'),
      pending: withStatus(pendingCompaniesQuery.data?.companies, 'pending'),
      suspended: withStatus(suspendedCompaniesQuery.data?.companies, 'suspended'),
    }),
    [
      activeCompaniesQuery.data?.companies,
      pendingCompaniesQuery.data?.companies,
      suspendedCompaniesQuery.data?.companies,
    ]
  );

  const allCompanies = useMemo(
    () =>
      dedupeCompanies([
        ...companyBuckets.active,
        ...companyBuckets.pending,
        ...companyBuckets.suspended,
      ]),
    [companyBuckets.active, companyBuckets.pending, companyBuckets.suspended]
  );

  const companiesByTab = useMemo(
    () => ({
      all: allCompanies,
      active: companyBuckets.active,
      pending: companyBuckets.pending,
      suspended: companyBuckets.suspended,
    }),
    [allCompanies, companyBuckets.active, companyBuckets.pending, companyBuckets.suspended]
  );

  const filteredCompanies = useMemo(
    () => filterCompaniesByKeyword(companiesByTab[statusTab], keyword),
    [companiesByTab, keyword, statusTab]
  );

  const counts = useMemo(
    () => ({
      all: allCompanies.length,
      active: companyBuckets.active.length,
      pending: companyBuckets.pending.length,
      suspended: companyBuckets.suspended.length,
    }),
    [
      allCompanies.length,
      companyBuckets.active.length,
      companyBuckets.pending.length,
      companyBuckets.suspended.length,
    ]
  );

  const isLoading =
    !canAccess ||
    activeCompaniesQuery.isLoading ||
    pendingCompaniesQuery.isLoading ||
    suspendedCompaniesQuery.isLoading;

  const hasError =
    activeCompaniesQuery.isError ||
    pendingCompaniesQuery.isError ||
    suspendedCompaniesQuery.isError;

  const errorMessage =
    normalizeError(
      activeCompaniesQuery.error || pendingCompaniesQuery.error || suspendedCompaniesQuery.error
    ).message || '업체 목록을 불러오지 못했습니다.';

  const handleRefetchAll = () => {
    void Promise.all([
      activeCompaniesQuery.refetch(),
      pendingCompaniesQuery.refetch(),
      suspendedCompaniesQuery.refetch(),
    ]);
  };

  const handleDelete = (company: CompanyRow) => {
    openDialog({
      type: 'warn',
      title: `${company.name} 업체를 삭제할까요?`,
      description: '현재 관리자 화면에서는 삭제 후 복원 기능을 제공하지 않습니다.',
      primaryActionLabel: '삭제',
      secondaryActionLabel: '취소',
      onPrimaryAction: async () => {
        try {
          setIsDeletingId(company.id);
          await deleteAdminCompany(company.id);
          await queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.GET_ADMIN_COMPANIES,
          });
          showToast({
            title: '업체가 삭제되었습니다.',
            icon: 'check',
          });
        } catch (error) {
          showToast({
            title: normalizeError(error).message || '업체 삭제에 실패했습니다.',
            icon: 'exclaim',
          });
        } finally {
          setIsDeletingId(null);
        }
      },
    });
  };

  const handleOpenEdit = (companyId: number) => {
    setEditingCompanyId(companyId);
  };

  const handleCloseEdit = () => {
    setEditingCompanyId(null);
  };

  const handleToggleStatus = async (company: CompanyRow, nextChecked: boolean) => {
    try {
      setIsStatusUpdatingId(company.id);

      if (nextChecked) {
        await postAdminCompanyApprove(company.id);
      } else {
        await postAdminCompanySuspend(company.id);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_ADMIN_COMPANIES,
        }),
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_COMPANY_DETAIL, company.id],
        }),
      ]);

      showToast({
        title: nextChecked ? '업체가 승인되었습니다.' : '업체가 중지되었습니다.',
        icon: 'check',
      });
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '업체 상태 변경에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setIsStatusUpdatingId(null);
    }
  };

  const handleApprove = async (company: CompanyRow) => {
    try {
      setIsStatusUpdatingId(company.id);
      await postAdminCompanyApprove(company.id);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_ADMIN_COMPANIES,
        }),
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.GET_ADMIN_COMPANY_DETAIL, company.id],
        }),
      ]);

      showToast({
        title: '업체가 승인되었습니다.',
        icon: 'check',
      });
    } catch (error) {
      showToast({
        title: normalizeError(error).message || '업체 승인에 실패했습니다.',
        icon: 'exclaim',
      });
    } finally {
      setIsStatusUpdatingId(null);
    }
  };

  if (isLoading) {
    return <Loading title="업체 관리 화면을 준비하는 중입니다." fullHeight />;
  }

  return (
    <div css={page}>
      <div css={pageHeader}>
        <div css={pageHeaderCopy}>
          <Text tag="h1" typo="title_S" css={pageHeaderTitle}>
            업체 관리
          </Text>
          <Text typo="body10" css={pageHeaderMeta}>
            등록, 수정, 삭제와 프로그램 관리
          </Text>
        </div>
        <div css={pageHeaderActions}>
          <Link href={ROUTES.ADMIN_COMPANY_NEW} css={addLinkButton}>
            신규 등록
          </Link>
        </div>
      </div>

      <div css={topControls}>
        <div css={statusTabs}>
          {STATUS_META.map((tab) => {
            const isActive = statusTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                css={statusTabButton(isActive)}
                onClick={() => setStatusTab(tab.value)}
              >
                <span>{tab.label}</span>
                <span css={statusTabCount(isActive)}>{counts[tab.value]}</span>
              </button>
            );
          })}
        </div>

        <div css={viewToggle}>
          {VIEW_OPTIONS.map((option) => {
            const isActive = viewMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                css={viewToggleButton(isActive)}
                onClick={() => setViewMode(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div css={searchRow}>
        <label css={searchBox}>
          <span css={searchIcon}>⌕</span>
          <input
            css={searchInput}
            placeholder="이름, 주소 검색"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </label>
      </div>

      <section css={resultPanel}>
        <div css={resultPanelHeader}>
          <div>
            <Text typo="subtitle1" css={resultTitle}>
              {statusTab === 'all' ? '업체 목록' : `${STATUS_LABELS[statusTab]} 업체`}
            </Text>
          </div>
          <Text typo="body9" css={resultCount}>
            총 {filteredCompanies.length}건
          </Text>
        </div>

        {hasError ? (
          <div css={emptyState}>
            <Text typo="body4" css={emptyTitle}>
              업체 목록을 불러오지 못했습니다.
            </Text>
            <Text typo="body10" css={emptyDescription}>
              {errorMessage}
            </Text>
            <button type="button" css={retryButton} onClick={handleRefetchAll}>
              다시 시도
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div css={emptyState}>
            <Text typo="body4" css={emptyTitle}>
              조건에 맞는 업체가 없습니다.
            </Text>
            <Text typo="body10" css={emptyDescription}>
              검색어 또는 상태 탭을 변경해 다시 확인해주세요.
            </Text>
          </div>
        ) : viewMode === 'table' ? (
          <div css={tableWrap}>
            <table css={table}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>이름</th>
                  <th>주소</th>
                  <th>카테고리</th>
                  <th>활성 상태</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company, index) => (
                  <tr key={`${company.status}-${company.id}`}>
                    <td>{index + 1}</td>
                    <td>
                      <div css={tablePrimaryCell}>
                        <Text typo="body4" css={tablePrimaryTitle}>
                          {company.name}
                        </Text>
                        <div css={microMetaRow}>
                          {company.is_exclusive && <span css={microBadge}>독점</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <Text typo="body10" css={tableAddress}>
                        {company.simpleplace || company.address || '-'}
                      </Text>
                    </td>
                    <td>
                      <div css={tagStack}>
                        {(company.tags ?? []).length > 0 ? (
                          company.tags.map((tag) => (
                            <span key={`${company.id}-${tag}`} css={tagChip}>
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span css={mutedBadge}>미분류</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <CompanyStatusToggle
                        checked={company.status === 'active'}
                        disabled={isStatusUpdatingId === company.id}
                        onChange={(nextChecked) => void handleToggleStatus(company, nextChecked)}
                      />
                    </td>
                    <td>
                      <div css={rowActions}>
                        {isPendingCompany(company) && (
                          <button
                            type="button"
                            css={approveButton}
                            onClick={() => void handleApprove(company)}
                            disabled={isStatusUpdatingId === company.id}
                          >
                            {isStatusUpdatingId === company.id ? '승인 중...' : '승인'}
                          </button>
                        )}
                        {canOpenPrograms(company) && (
                          <Link
                            href={ROUTES.ADMIN_COMPANY_PROGRAMS(company.id)}
                            css={inlineActionButton}
                          >
                            프로그램
                          </Link>
                        )}
                        <button
                          type="button"
                          css={inlineActionButton}
                          onClick={() => handleOpenEdit(company.id)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          css={inlineDangerButton}
                          onClick={() => handleDelete(company)}
                          disabled={isDeletingId === company.id}
                        >
                          {isDeletingId === company.id ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div css={cardGrid}>
            {filteredCompanies.map((company) => (
              <article key={`${company.status}-${company.id}`} css={companyCard}>
                <div css={cardImageBlock(company.photos?.[0])}>
                  <div css={cardOverlay} />
                  <div css={cardTopRow}>
                    <CompanyStatusToggle
                      checked={company.status === 'active'}
                      disabled={isStatusUpdatingId === company.id}
                      onChange={(nextChecked) => void handleToggleStatus(company, nextChecked)}
                    />
                    {company.is_exclusive && <span css={featureBadge}>독점</span>}
                  </div>
                  <div css={cardHeadline}>
                    <Text typo="subtitle1" css={cardTitle}>
                      {company.name}
                    </Text>
                    <Text typo="body10" css={cardAddress}>
                      {company.simpleplace || company.address || '-'}
                    </Text>
                  </div>
                </div>

                <div css={cardBody}>
                  <div css={tagStack}>
                    {(company.tags ?? []).length > 0 ? (
                      company.tags.map((tag) => (
                        <span key={`${company.id}-${tag}`} css={tagChip}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span css={mutedBadge}>미분류</span>
                    )}
                  </div>

                  <div css={cardActions}>
                    {isPendingCompany(company) && (
                      <AdminActionButton
                        variant="primary"
                        onClick={() => void handleApprove(company)}
                        disabled={isStatusUpdatingId === company.id}
                      >
                        {isStatusUpdatingId === company.id ? '승인 중...' : '승인'}
                      </AdminActionButton>
                    )}
                    {canOpenPrograms(company) && (
                      <AdminActionButton
                        href={ROUTES.ADMIN_COMPANY_PROGRAMS(company.id)}
                        variant="ghost"
                      >
                        프로그램
                      </AdminActionButton>
                    )}
                    <AdminActionButton variant="primary" onClick={() => handleOpenEdit(company.id)}>
                      수정
                    </AdminActionButton>
                    <AdminActionButton
                      variant="danger"
                      onClick={() => handleDelete(company)}
                      disabled={isDeletingId === company.id}
                    >
                      {isDeletingId === company.id ? '삭제 중...' : '삭제'}
                    </AdminActionButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {editingCompanyId !== null && (
        <AdminCompanyFormPage
          mode="edit"
          companyId={editingCompanyId}
          presentation="sheet"
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
}

function CompanyStatusToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div css={statusToggleRow}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={checked ? '활성 상태 토글' : '비활성 상태 토글'}
        css={statusToggle(checked, Boolean(disabled))}
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span css={statusToggleThumb(checked)} />
      </button>
    </div>
  );
}

const page = css`
  min-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const pageHeader = adminCompactHeader;

const pageHeaderCopy = adminCompactHeaderCopy;

const pageHeaderActions = adminCompactHeaderActions;

const pageHeaderTitle = adminSectionTitle;

const pageHeaderMeta = adminSectionSubtitle;

const topControls = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 1080px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const statusTabs = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 6px;
  border-radius: 18px;
  background: rgba(18, 28, 44, 0.92);
`;

const statusTabButton = (active: boolean) => css`
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  background: ${active ? 'rgba(246, 250, 255, 0.98)' : 'transparent'};
  color: ${active ? '#0d1727' : '#b7c3d7'};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
`;

const statusTabCount = (active: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${active ? 'rgba(13, 23, 39, 0.08)' : 'rgba(248, 250, 252, 0.08)'};
  color: inherit;
  font-size: 11px;
  font-weight: 800;
`;

const viewToggle = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 18px;
  background: rgba(18, 28, 44, 0.92);
`;

const viewToggleButton = (active: boolean) => css`
  border: none;
  min-width: 80px;
  height: 38px;
  border-radius: 12px;
  background: ${active ? 'rgba(132, 155, 130, 0.24)' : 'transparent'};
  color: ${active ? '#edf7ef' : '#8fa0b9'};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;

const searchRow = css`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 1080px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const searchBox = css`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 54px;
  padding: 0 16px;
  border-radius: 18px;
  background: rgba(245, 247, 251, 0.08);
`;

const searchIcon = css`
  color: #99a8bd;
  font-size: 18px;
  line-height: 1;
`;

const searchInput = css`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #f8fbff;
  font-size: 15px;
  font-weight: 500;

  &::placeholder {
    color: #8b97a9;
  }
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

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const resultTitle = css`
  color: #f6f9ff;
`;

const resultCount = css`
  color: #9dadc4;
`;

const emptyState = css`
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
`;

const emptyTitle = css`
  color: #f4f7fb;
`;

const emptyDescription = css`
  color: #91a1b8;
`;

const retryButton = css`
  border: 1px solid rgba(163, 181, 203, 0.2);
  border-radius: 14px;
  min-width: 120px;
  height: 44px;
  background: rgba(255, 255, 255, 0.04);
  color: #eff5ff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const tableWrap = css`
  width: 100%;
  overflow-x: auto;
`;

const table = css`
  width: 100%;
  min-width: 980px;
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
    padding: 22px 20px;
    vertical-align: top;
    color: #eef4ff;
    border-bottom: 1px solid rgba(142, 164, 190, 0.1);
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const tablePrimaryCell = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const tablePrimaryTitle = css`
  color: #f6f9ff;
`;

const tableAddress = css`
  color: #c6d1e0;
  white-space: pre-wrap;
`;

const microMetaRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const microBadge = css`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(132, 155, 130, 0.18);
  color: #d7e6d8;
  font-size: 12px;
  font-weight: 700;
`;

const tagStack = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const tagChip = css`
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(132, 155, 130, 0.24);
  background: rgba(18, 28, 44, 0.82);
  color: #d5e1d7;
  font-size: 12px;
  font-weight: 700;
`;

const mutedBadge = css`
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #90a1b8;
  font-size: 12px;
  font-weight: 700;
`;

const statusToggleRow = css`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const statusToggle = (checked: boolean, disabled: boolean) => css`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 46px;
  height: 28px;
  padding: 0 3px;
  border: none;
  border-radius: 999px;
  background: ${checked ? 'rgba(132, 155, 130, 0.72)' : 'rgba(255, 255, 255, 0.14)'};
  cursor: ${disabled ? 'not-allowed' : 'pointer'};
  transition:
    background 0.18s ease,
    opacity 0.18s ease;
  opacity: ${disabled ? 0.55 : 1};
`;

const statusToggleThumb = (checked: boolean) => css`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #07111d;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
  transform: translateX(${checked ? '18px' : '0'});
  transition: transform 0.18s ease;
`;

const rowActions = css`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const approveButton = adminInlineGhostButton;

const inlineActionButton = adminInlineGhostButton;

const inlineDangerButton = adminInlineDangerButton;

const cardGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  padding: 20px;
`;

const companyCard = css`
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(14, 22, 35, 0.98);
  border: 1px solid rgba(142, 164, 190, 0.12);
  box-shadow: 0 20px 50px rgba(2, 6, 14, 0.32);
`;

const cardImageBlock = (imageUrl?: string) => css`
  position: relative;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px;
  background: ${imageUrl
    ? `linear-gradient(180deg, rgba(4, 8, 15, 0.1) 0%, rgba(4, 8, 15, 0.78) 100%), url(${JSON.stringify(imageUrl)}) center / cover no-repeat`
    : 'linear-gradient(135deg, rgba(53, 72, 58, 0.62) 0%, rgba(9, 17, 28, 1) 100%)'};
`;

const cardOverlay = css`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(132, 155, 130, 0.18), transparent 32%);
  pointer-events: none;
`;

const cardTopRow = css`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const featureBadge = css`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.92);
  color: #0f1727;
  font-size: 12px;
  font-weight: 800;
`;

const cardHeadline = css`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const cardTitle = css`
  color: #f9fbff;
`;

const cardAddress = css`
  color: #d2dceb;
`;

const cardBody = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
`;

const cardActions = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const addLinkButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  min-width: 76px;
  height: 36px;
  padding: 0 14px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  background: linear-gradient(135deg, #6f66ff 0%, #4f46e5 100%);
  color: ${colors.white};
`;
