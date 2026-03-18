import Link from 'next/link';
import { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { Loading } from '@/components/common';
import {
  adminCompactHeader,
  adminCompactHeaderActions,
  adminCompactHeaderCopy,
  adminConsolePalette,
  adminConsoleSection,
  adminEmptyDescription,
  adminEmptyState,
  adminEmptyTitle,
  adminGhostButton,
  adminPage,
  adminSearchBox,
  adminSearchIcon,
  adminSearchInput,
  adminSectionSubtitle,
  adminSectionTitle,
  adminTagChip,
} from '@/components/admin/admin-console.styles';
import { Text } from '@/components/text';
import { ROUTES } from '@/constants';
import { useAdminRouteGuard } from '@/hooks';
import { useGetAdminCompanyDetailQuery, useGetAdminCompanyReviewsQuery } from '@/queries';
import { normalizeError } from '@/utils/error-handler';
import { toSearchableText } from '@/utils/search';

const parseCompanyId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return Number(value[0]);
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
};

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

export default function AdminCompanyReviewsPage() {
  const router = useRouter();
  const { canAccess, isReady } = useAdminRouteGuard();
  const companyId = parseCompanyId(router.query.companyId);
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [keyword, setKeyword] = useState('');

  const companyDetailQuery = useGetAdminCompanyDetailQuery(
    Number.isNaN(companyId) ? null : companyId,
    canAccess && !Number.isNaN(companyId)
  );
  const reviewsQuery = useGetAdminCompanyReviewsQuery(
    Number.isNaN(companyId) ? null : companyId,
    {
      skip: 0,
      limit: 100,
      with_photos: withPhotosOnly,
    },
    canAccess && !Number.isNaN(companyId)
  );
  const filteredReviews = useMemo(() => {
    const searchTerm = toSearchableText(keyword);
    const list = reviewsQuery.data?.reviews ?? [];
    if (!searchTerm) return list;

    const searchFields = [
      companyDetailQuery.data?.company?.name ?? '',
      companyDetailQuery.data?.company?.address ?? '',
      companyDetailQuery.data?.company?.simpleplace ?? '',
    ];
    const isMatch = searchFields.some((field) => toSearchableText(field).includes(searchTerm));

    return isMatch ? list : [];
  }, [
    companyDetailQuery.data?.company?.address,
    companyDetailQuery.data?.company?.name,
    companyDetailQuery.data?.company?.simpleplace,
    keyword,
    reviewsQuery.data?.reviews,
  ]);

  if (
    !router.isReady ||
    !isReady ||
    !canAccess ||
    companyDetailQuery.isLoading ||
    reviewsQuery.isLoading
  ) {
    return <Loading title="업체 리뷰를 불러오는 중입니다." fullHeight />;
  }

  if (Number.isNaN(companyId) || companyDetailQuery.isError) {
    return (
      <section css={surface}>
        <Text tag="h2" typo="title1" css={adminEmptyTitle}>
          업체 정보를 불러오지 못했습니다.
        </Text>
        <Text typo="body10" css={adminEmptyDescription}>
          {companyDetailQuery.isError
            ? normalizeError(companyDetailQuery.error).message
            : '잘못된 업체 ID입니다.'}
        </Text>
      </section>
    );
  }

  return (
    <div css={page}>
      <section css={pageHeader}>
        <div css={pageHeaderCopy}>
          <Text tag="h1" typo="title_S" css={pageHeaderTitle}>
            업체 리뷰
          </Text>
          <Text typo="body10" css={pageHeaderMeta}>
            리뷰 목록을 업체 단위로 모아 빠르게 검수할 수 있도록 콘솔 레이아웃으로 정리했습니다.
          </Text>
          <Text typo="body11" css={companyMeta}>
            {companyDetailQuery.data?.company?.name} /{' '}
            {companyDetailQuery.data?.company?.company_code}
          </Text>
        </div>
        <div css={pageHeaderActions}>
          <Link href={ROUTES.ADMIN_REVIEWS} css={secondaryLink}>
            리뷰 목록
          </Link>
        </div>
      </section>

      <section css={surface}>
        <div css={toolbar}>
          <label css={searchField}>
            <span css={adminSearchIcon}>⌕</span>
            <input
              css={adminSearchInput}
              placeholder="이름, 주소 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </label>
          <label css={toggleRow}>
            <input
              type="checkbox"
              checked={withPhotosOnly}
              onChange={(event) => setWithPhotosOnly(event.target.checked)}
            />
            <Text typo="body10" css={toggleLabel}>
              이미지 포함 리뷰만 보기
            </Text>
          </label>
        </div>

        {reviewsQuery.isError ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              리뷰를 불러오지 못했습니다.
            </Text>
            <Text typo="body10" css={adminEmptyDescription}>
              {normalizeError(reviewsQuery.error).message}
            </Text>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div css={adminEmptyState}>
            <Text typo="body4" css={adminEmptyTitle}>
              표시할 리뷰가 없습니다.
            </Text>
          </div>
        ) : (
          <div css={reviewGrid}>
            {filteredReviews.map((review) => (
              <article key={review.id} css={reviewCard}>
                <div css={reviewHeader}>
                  <div css={reviewHeaderCopy}>
                    <Text typo="subtitle1" css={cardTitle}>
                      {review.program_name}
                    </Text>
                    <Text typo="body10" css={cardMeta}>
                      {review.reviewer_username} · {review.customer_country}
                    </Text>
                  </div>
                  <Text typo="body12" css={cardMeta}>
                    {formatDateTime(review.created_at)}
                  </Text>
                </div>

                <div css={tagRow}>
                  {(review.tags ?? []).map((tag) => (
                    <span key={`${review.id}-${tag}`} css={tagChip}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div css={contentBox}>
                  <Text typo="body10" css={cardTitle}>
                    {review.content}
                  </Text>
                </div>

                <div css={metaRow}>
                  <MetaField label="가격" value={`KRW ${review.program_price ?? '-'}`} />
                  <MetaField label="소요시간" value={`${review.duration_minutes ?? '-'}분`} />
                  <MetaField
                    label="첫 방문"
                    value={review.is_first_visit == null ? '-' : review.is_first_visit ? 'Y' : 'N'}
                  />
                </div>

                <div css={imageGallery}>
                  {(review.image_urls ?? []).length > 0 ? (
                    (review.image_urls ?? []).map((url) => <div key={url} css={reviewImage(url)} />)
                  ) : review.primary_image_url ? (
                    <div css={reviewImage(review.primary_image_url)} />
                  ) : (
                    <div css={imagePlaceholder}>이미지 없음</div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div css={metaCard}>
      <Text typo="body12" css={metaLabel}>
        {label}
      </Text>
      <Text typo="body10" css={metaValue}>
        {value}
      </Text>
    </div>
  );
}

const page = adminPage;

const pageHeader = adminCompactHeader;

const pageHeaderCopy = adminCompactHeaderCopy;

const pageHeaderActions = adminCompactHeaderActions;

const pageHeaderTitle = adminSectionTitle;

const pageHeaderMeta = adminSectionSubtitle;

const companyMeta = css`
  color: ${adminConsolePalette.textDim};
`;

const surface = adminConsoleSection;

const toolbar = css`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const toggleRow = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${adminConsolePalette.textStrong};
`;

const toggleLabel = css`
  color: ${adminConsolePalette.textStrong};
`;

const searchField = css`
  ${adminSearchBox};
  width: 100%;
  max-width: 320px;
`;

const reviewGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const reviewCard = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(14, 22, 35, 0.94);
  border: 1px solid ${adminConsolePalette.borderSoft};
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

const cardTitle = css`
  color: ${adminConsolePalette.text};
`;

const cardMeta = css`
  color: ${adminConsolePalette.textSubtle};
`;

const tagRow = css`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 24px;
`;

const tagChip = adminTagChip;

const contentBox = css`
  min-height: 140px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const metaRow = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const metaCard = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
`;

const metaLabel = css`
  color: ${adminConsolePalette.textDim};
`;

const metaValue = css`
  color: ${adminConsolePalette.textStrong};
`;

const imageGallery = css`
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

const imagePlaceholder = css`
  grid-column: 1 / -1;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${adminConsolePalette.borderSoft};
  color: ${adminConsolePalette.textSubtle};
`;

const secondaryLink = adminGhostButton;
