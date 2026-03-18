import { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import {
  adminCapsuleBadge,
  adminSegmentButton,
  adminSegmentCount,
  adminSegmented,
} from '@/components/admin/admin-console.styles';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { AdminPageHeader } from '@/components/admin/common/AdminPageHeader';
import { AdminSearchField } from '@/components/admin/common/AdminSearchField';
import { Loading } from '@/components/common';
import { Text } from '@/components/text';
import { useAdminRouteGuard } from '@/hooks';
import type { AdminCompanyListItem, AdminCompanyReviewsResponse } from '@/models';
import { useGetAdminCompaniesQuery, useGetAdminCompanyReviewsQuery } from '@/queries';
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

const filterSelectedCompanyReviewsByKeyword = (
  reviews: AdminCompanyReviewsResponse['reviews'] | undefined,
  keyword: string,
  company: CompanyRow | null
) => {
  const searchTerm = toSearchableText(keyword);
  const list = reviews ?? [];
  if (!searchTerm || !company) return list;

  const searchFields = [company.name, company.address, company.simpleplace ?? ''];
  const isMatch = searchFields.some((field) => toSearchableText(field).includes(searchTerm));

  return isMatch ? list : [];
};

const formatStatusLabel = (status: Exclude<CompanyStatusTab, 'all'>) => STATUS_LABELS[status];

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

export default function AdminReviewsPage() {
  const { canAccess, isReady } = useAdminRouteGuard();

  const [statusTab, setStatusTab] = useState<CompanyStatusTab>('active');
  const [viewMode, setViewMode] = useState<CompanyViewMode>('table');
  const [keyword, setKeyword] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [reviewKeyword, setReviewKeyword] = useState('');
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);

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

  useEffect(() => {
    if (selectedCompanyId == null) return;
    const isVisible = filteredCompanies.some((company) => company.id === selectedCompanyId);
    if (!isVisible) {
      setSelectedCompanyId(null);
      setReviewKeyword('');
      setWithPhotosOnly(false);
    }
  }, [filteredCompanies, selectedCompanyId]);

  const selectedCompany = useMemo(
    () => allCompanies.find((company) => company.id === selectedCompanyId) ?? null,
    [allCompanies, selectedCompanyId]
  );

  const reviewsQuery = useGetAdminCompanyReviewsQuery(
    selectedCompanyId,
    {
      skip: 0,
      limit: 100,
      with_photos: withPhotosOnly,
    },
    canAccess && selectedCompanyId != null
  );

  const filteredReviews = useMemo(
    () =>
      filterSelectedCompanyReviewsByKeyword(
        reviewsQuery.data?.reviews,
        reviewKeyword,
        selectedCompany
      ),
    [reviewKeyword, reviewsQuery.data?.reviews, selectedCompany]
  );

  const isLoading =
    !isReady ||
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

  if (isLoading) {
    return <Loading title="리뷰 관리 화면을 준비하는 중입니다." fullHeight />;
  }

  return (
    <div css={page}>
      <AdminPageHeader
        as="div"
        title="리뷰 관리"
        description="업체를 선택하면 같은 화면에서 리뷰 리스트를 검토합니다."
      />

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
        <AdminSearchField
          value={keyword}
          onChange={setKeyword}
          placeholder="이름, 주소 검색"
          containerCss={searchField}
        />
      </div>

      <section css={resultPanel}>
        <div css={resultPanelHeader}>
          <div>
            <Text typo="subtitle1" css={resultTitle}>
              {statusTab === 'all' ? '리뷰 대상 업체 목록' : `${STATUS_LABELS[statusTab]} 업체`}
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
                {filteredCompanies.map((company, index) => {
                  const isSelected = selectedCompanyId === company.id;
                  return (
                    <tr key={`${company.status}-${company.id}`} css={tableRow(isSelected)}>
                      <td>{index + 1}</td>
                      <td>
                        <div css={tablePrimaryCell}>
                          <Text typo="body4" css={tablePrimaryTitle}>
                            {company.name}
                          </Text>
                          {company.is_exclusive && (
                            <div css={microMetaRow}>
                              <span css={microBadge}>독점</span>
                            </div>
                          )}
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
                        <span css={statusBadge(company.status)}>
                          {formatStatusLabel(company.status)}
                        </span>
                      </td>
                      <td>
                        <AdminActionButton
                          variant={isSelected ? 'primary' : 'ghost'}
                          onClick={() =>
                            setSelectedCompanyId((prev) =>
                              prev === company.id ? null : company.id
                            )
                          }
                        >
                          {isSelected ? '리뷰 닫기' : '리뷰 보기'}
                        </AdminActionButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div css={cardGrid}>
            {filteredCompanies.map((company) => {
              const isSelected = selectedCompanyId === company.id;
              return (
                <article key={`${company.status}-${company.id}`} css={companyCard(isSelected)}>
                  <div css={cardImageBlock(company.photos?.[0])}>
                    <div css={cardOverlay} />
                    <div css={cardTopRow}>
                      <span css={statusBadge(company.status)}>
                        {formatStatusLabel(company.status)}
                      </span>
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
                      <AdminActionButton
                        variant={isSelected ? 'primary' : 'ghost'}
                        onClick={() =>
                          setSelectedCompanyId((prev) => (prev === company.id ? null : company.id))
                        }
                      >
                        {isSelected ? '리뷰 닫기' : '리뷰 보기'}
                      </AdminActionButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section css={reviewPanel}>
        <div css={reviewPanelHeader}>
          <div>
            <Text typo="subtitle1" css={resultTitle}>
              {selectedCompany ? `${selectedCompany.name} 리뷰 리스트` : '리뷰 리스트'}
            </Text>
            <Text typo="body11" css={reviewPanelDescription}>
              {selectedCompany
                ? '선택한 업체의 리뷰를 같은 화면에서 검토합니다.'
                : '업체 목록에서 리뷰 보기를 누르면 여기에서 리뷰가 열립니다.'}
            </Text>
          </div>
          {selectedCompany && (
            <Text typo="body9" css={resultCount}>
              총 {filteredReviews.length}건
            </Text>
          )}
        </div>

        {!selectedCompany ? (
          <div css={emptyState}>
            <Text typo="body4" css={emptyTitle}>
              아직 선택된 업체가 없습니다.
            </Text>
            <Text typo="body10" css={emptyDescription}>
              위 업체 목록에서 리뷰 보기를 눌러주세요.
            </Text>
          </div>
        ) : (
          <>
            <div css={reviewControls}>
              <AdminSearchField
                value={reviewKeyword}
                onChange={setReviewKeyword}
                placeholder="이름, 주소 검색"
                containerCss={reviewSearchField}
              />

              <label css={toggleLabel}>
                <input
                  type="checkbox"
                  checked={withPhotosOnly}
                  onChange={(event) => setWithPhotosOnly(event.target.checked)}
                />
                <span>이미지 포함 리뷰만 보기</span>
              </label>
            </div>

            {reviewsQuery.isLoading ? (
              <Loading title="리뷰를 불러오는 중입니다." />
            ) : reviewsQuery.isError ? (
              <div css={emptyState}>
                <Text typo="body4" css={emptyTitle}>
                  리뷰를 불러오지 못했습니다.
                </Text>
                <Text typo="body10" css={emptyDescription}>
                  {normalizeError(reviewsQuery.error).message}
                </Text>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div css={emptyState}>
                <Text typo="body4" css={emptyTitle}>
                  표시할 리뷰가 없습니다.
                </Text>
                <Text typo="body10" css={emptyDescription}>
                  검색 조건 또는 필터를 변경해 다시 확인해주세요.
                </Text>
              </div>
            ) : (
              <div css={reviewGrid}>
                {filteredReviews.map((review: AdminCompanyReviewsResponse['reviews'][number]) => (
                  <article key={review.id} css={reviewCard}>
                    <div css={reviewHeader}>
                      <div css={reviewHeaderCopy}>
                        <Text typo="subtitle1" css={cardTitle}>
                          {review.program_name}
                        </Text>
                        <Text typo="body10" css={reviewMeta}>
                          {review.reviewer_username} · {review.customer_country}
                        </Text>
                      </div>
                      <Text typo="body12" css={reviewMeta}>
                        {formatDateTime(review.created_at)}
                      </Text>
                    </div>

                    <div css={tagStack}>
                      {(review.tags ?? []).length > 0 ? (
                        review.tags.map((tag: string) => (
                          <span key={`${review.id}-${tag}`} css={tagChip}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span css={mutedBadge}>태그 없음</span>
                      )}
                    </div>

                    <div css={reviewContentBox}>
                      <Text typo="body10" css={reviewContent}>
                        {review.content || '-'}
                      </Text>
                    </div>

                    <div css={reviewMetaGrid}>
                      <div css={reviewMetaCard}>
                        <Text typo="body12" css={reviewMetaLabel}>
                          가격
                        </Text>
                        <Text typo="body10" css={reviewMetaValue}>
                          KRW {review.program_price ?? '-'}
                        </Text>
                      </div>
                      <div css={reviewMetaCard}>
                        <Text typo="body12" css={reviewMetaLabel}>
                          소요시간
                        </Text>
                        <Text typo="body10" css={reviewMetaValue}>
                          {review.duration_minutes ?? '-'}분
                        </Text>
                      </div>
                      <div css={reviewMetaCard}>
                        <Text typo="body12" css={reviewMetaLabel}>
                          첫 방문
                        </Text>
                        <Text typo="body10" css={reviewMetaValue}>
                          {review.is_first_visit == null ? '-' : review.is_first_visit ? 'Y' : 'N'}
                        </Text>
                      </div>
                    </div>

                    <div css={reviewImageGrid}>
                      {(review.image_urls ?? []).length > 0 ? (
                        (review.image_urls ?? []).map((url: string) => (
                          <div key={url} css={reviewImage(url)} />
                        ))
                      ) : review.primary_image_url ? (
                        <div css={reviewImage(review.primary_image_url)} />
                      ) : (
                        <div css={reviewImagePlaceholder}>이미지 없음</div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const page = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

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

const statusTabs = adminSegmented;

const statusTabButton = adminSegmentButton;

const statusTabCount = adminSegmentCount;

const viewToggle = adminSegmented;

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

const searchField = css`
  flex: 1;
  min-width: 0;
`;

const reviewSearchField = css`
  ${searchField};
  min-height: 50px;
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
`;

const resultTitle = css`
  color: #f6f9ff;
`;

const resultCount = css`
  color: #9dadc4;
`;

const emptyState = css`
  min-height: 240px;
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
  border-radius: 12px;
  min-width: 120px;
  height: 38px;
  background: rgba(255, 255, 255, 0.04);
  color: #eff5ff;
  font-size: 13px;
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
`;

const tableRow = (selected: boolean) => css`
  background: ${selected ? 'rgba(132, 155, 130, 0.08)' : 'transparent'};
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

const statusBadge = (status: Exclude<CompanyStatusTab, 'all'>) => css`
  ${adminCapsuleBadge({
    background:
      status === 'active'
        ? 'rgba(132, 155, 130, 0.2)'
        : status === 'pending'
          ? 'rgba(227, 179, 111, 0.2)'
          : 'rgba(255, 103, 103, 0.16)',
    color: status === 'active' ? '#d7e6d8' : status === 'pending' ? '#f3d5a6' : '#ffc8c8',
  })};
`;

const cardGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
  padding: 20px;
`;

const companyCard = (selected: boolean) => css`
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(14, 22, 35, 0.98);
  border: 1px solid ${selected ? 'rgba(132, 155, 130, 0.28)' : 'rgba(142, 164, 190, 0.12)'};
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
  gap: 10px;
  flex-wrap: wrap;
`;

const reviewPanel = css`
  border-radius: 28px;
  background: rgba(7, 13, 23, 0.94);
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(2, 6, 14, 0.24);
`;

const reviewPanelHeader = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
`;

const reviewPanelDescription = css`
  color: #8d9aaf;
  margin-top: 6px;
`;

const reviewControls = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;

  @media (max-width: 1080px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const toggleLabel = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #dbe5f4;
  font-size: 13px;
  font-weight: 600;

  input {
    accent-color: #849b82;
  }
`;

const reviewGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  padding: 20px;
`;

const reviewCard = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(14, 22, 35, 0.94);
  border: 1px solid rgba(142, 164, 190, 0.12);
`;

const reviewHeader = css`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const reviewHeaderCopy = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const reviewMeta = css`
  color: #9eb0c8;
`;

const reviewContentBox = css`
  min-height: 140px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(142, 164, 190, 0.12);
`;

const reviewContent = css`
  color: #eef4ff;
`;

const reviewMetaGrid = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const reviewMetaCard = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(142, 164, 190, 0.12);
`;

const reviewMetaLabel = css`
  color: #7888a0;
`;

const reviewMetaValue = css`
  color: #eef4ff;
`;

const reviewImageGrid = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const reviewImage = (url: string) => css`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  background: url(${JSON.stringify(url)}) center / cover no-repeat;
`;

const reviewImagePlaceholder = css`
  grid-column: 1 / -1;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(142, 164, 190, 0.12);
  color: #9eb0c8;
`;
