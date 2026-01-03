/** @jsxImportSource @emotion/react */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Empty, Text } from '@/components';
import { Card } from '@/components/reviews/card';
import { useDialog, useToast } from '@/hooks';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/constants';
import { Loading } from '@/components/common';
import { useDeleteReviewMutation, useGetMyReviewsQuery } from '@/queries';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/queries/query-keys';
import {
  pageWrapper,
  countCard,
  reviewList,
  emptyState,
  sheetOverlay,
  sheetContainer,
  sheetHandle,
  sheetList,
  sheetButton,
} from '@/styles/pages/mypage-reviews.styles';
import { css } from '@emotion/react';

interface MyReviewCardProps {
  reviewId: number;
  programId: number;
  companyCode: string;
  companyId: number;
  companyName: string;
  companyImageUrl: string | null;
  content: string;
  tags: string[];
  imageUrls: string[] | null;
  primaryImageUrl: string | null;
  createdAt: string;
  programName: string;
  programPrice: number;
  programDurationMinutes: number;
  onMenuClick: (reviewId: number) => void;
}

interface Props {
  variant?: 'page' | 'embedded';
}

const embeddedWrapper = css`
  min-height: auto;
  padding: 0;
  background: transparent;
`;

function MyReviewCard({
  reviewId,
  programId,
  companyCode,
  companyId,
  companyName,
  companyImageUrl,
  content,
  tags,
  imageUrls,
  primaryImageUrl,
  createdAt,
  programName,
  programPrice,
  programDurationMinutes,
  onMenuClick,
}: MyReviewCardProps) {
  const reviewerName = companyName || companyCode || '-';
  const programImageUrl = primaryImageUrl ?? null;

  return (
    <Card
      reviewId={reviewId}
      reviewerName={reviewerName}
      reviewerImageUrl={companyImageUrl}
      keywordReviewList={tags}
      content={content}
      imageUrlList={imageUrls || []}
      createdAt={createdAt}
      programId={programId}
      companyId={companyId}
      programName={programName}
      programPrice={programPrice}
      programDurationMinutes={programDurationMinutes}
      programImageUrl={programImageUrl ?? undefined}
      onMenuClick={onMenuClick}
    />
  );
}

// 내가 작성한 리뷰 조회
export function MyReviewsPanel({ variant = 'page' }: Props) {
  const router = useRouter();
  const tReviewList = useTranslations('review-list');
  const tReview = useTranslations('review');
  const tCommon = useTranslations('common');
  const { showToast } = useToast();
  const { open } = useDialog();
  const queryClient = useQueryClient();

  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isLoading } = useGetMyReviewsQuery({ skip: 0, limit: 20 });
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteReviewMutation();

  const reviews = useMemo(() => data?.reviews ?? [], [data]);
  const reviewCount = data?.total ?? reviews.length;
  const wrapperStyle = variant === 'embedded' ? [pageWrapper, embeddedWrapper] : pageWrapper;

  const handleOpenSheet = (reviewId: number) => {
    setActiveReviewId(reviewId);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleEdit = () => {
    if (!activeReviewId) return;
    setIsSheetOpen(false);
    router.push(`${ROUTES.REVIEW}/${activeReviewId}`);
  };

  const handleDelete = () => {
    if (!activeReviewId) return;
    deleteReview(
      { reviewId: activeReviewId },
      {
        onSuccess: () => {
          setIsSheetOpen(false);
          showToast({ title: tCommon('success.deleted') });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_MY_REVIEWS });
        },
        onError: (error: unknown) => {
          setIsSheetOpen(false);
          open({
            type: 'warn',
            title: tReview('updateFail'),
            description: String(error),
            primaryActionLabel: tCommon('button.confirm'),
          });
        },
      }
    );
  };

  return (
    <>
      <div css={wrapperStyle}>
        <div css={countCard}>
          <Text typo="button_M" color="text_primary">
            {tReviewList('reviewCount', { count: reviewCount })}
          </Text>
        </div>

        {isLoading ? (
          <Loading title={tReviewList('loading')} />
        ) : reviews.length === 0 ? (
          <div css={emptyState}>
            <Empty title={tReview('empty')} />
          </div>
        ) : (
          <div css={reviewList}>
            {reviews.map((review) => (
              <MyReviewCard
                key={review.id}
                reviewId={review.id}
                programId={review.program_id}
                companyCode={review.company_code}
                companyId={review.company_id}
                companyName={review.company_name}
                companyImageUrl={review.company_primary_image_url}
                content={review.content}
                tags={review.tags || []}
                imageUrls={review.image_urls}
                primaryImageUrl={review.primary_image_url}
                createdAt={review.created_at}
                programName={review.program_name}
                programPrice={review.program_price}
                programDurationMinutes={review.duration_minutes}
                onMenuClick={handleOpenSheet}
              />
            ))}
          </div>
        )}
      </div>

      {isSheetOpen && (
        <>
          <div css={sheetOverlay} onClick={handleCloseSheet} />
          <div css={sheetContainer}>
            <div css={sheetHandle} />
            <div css={sheetList}>
              <button css={sheetButton} onClick={handleEdit}>
                <Text typo="button_M" color="text_primary">
                  {tCommon('button.edit')}
                </Text>
              </button>
              <button css={sheetButton} onClick={handleDelete} disabled={isDeleting}>
                <Text typo="button_M" color="text_primary">
                  {tCommon('button.delete')}
                </Text>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
