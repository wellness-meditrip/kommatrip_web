import { useMemo, useState } from 'react';
import { Empty, Text, Loading } from '@/components';
import { Card } from '@/components/reviews/card';
import { ReasonModal } from '@/components/reviews/report-modal';
import { useIntersectionLoad } from '@/hooks/review';
import { useToast } from '@/hooks';
import { ReviewAi, ReviewTooltip } from '@/icons';
import {
  wrapper,
  reviewSummary,
  titleWrapper,
  title,
  toolTip,
  toolTipInfo,
  list,
  content,
  bottom,
} from './index.styles';
import { useGetGuestCompanyReviewsInfiniteQuery } from '@/queries/review';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants';
import { useTranslations } from 'next-intl';
import { useReportGuestReviewMutation, useReportReviewMutation } from '@/queries';
import { AxiosError } from 'axios';
import { useCurrentLocale } from '@/i18n/navigation';

interface CompanyReviewProps {
  companyId: number;
}

export function CompanyReview({ companyId }: CompanyReviewProps) {
  const router = useRouter();
  const t = useTranslations('review');
  const { showToast } = useToast();
  const currentLocale = useCurrentLocale();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<number | null>(null);
  const [activeIsGuestReview, setActiveIsGuestReview] = useState(true);
  const reportReviewMutation = useReportReviewMutation();
  const reportGuestReviewMutation = useReportGuestReviewMutation();
  // API 호출
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetGuestCompanyReviewsInfiniteQuery({
      companyId,
      limit: 20,
    });

  // 무한 스크롤을 위한 intersection observer
  const { loadMoreRef } = useIntersectionLoad({
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
  });

  // 리뷰 데이터 가공
  const reviewList = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.reviews || []);
  }, [data]);

  return (
    <section css={wrapper}>
      <div css={reviewSummary}>
        <div css={titleWrapper}>
          <div css={title}>
            <ReviewAi width="14" height="14" />
            <Text tag="p" typo="button_S" color="primary30">
              AI Review Summary
            </Text>
          </div>
          <div css={toolTip}>
            <ReviewTooltip width="14" height="14" />

            <div css={toolTipInfo}>
              <Text typo="body_S" color="text_secondary">
                <ul css={list}>
                  <li>{t('aiSummaryTip1')}</li>
                  <li>{t('aiSummaryTip2')}</li>
                  <li>{t('aiSummaryTip3')}</li>
                  <li>{t('aiSummaryTip4')}</li>
                </ul>
              </Text>
            </div>
          </div>
        </div>

        <Text typo="body_M" color="text_secondary">
          {/* {aiSummary} */}
          {t('aiSummaryEmpty')}
        </Text>
      </div>

      <div css={content}>
        {isLoading ? (
          <Loading title={t('loading')} />
        ) : reviewList.length > 0 ? (
          reviewList.map((review) => {
            const reviewId = review.id ?? (review as { review_id?: number }).review_id;
            if (!reviewId) {
              return null;
            }
            const isGuestReview = (review as { is_guest?: boolean }).is_guest ?? true;
            return (
              <Card
                key={reviewId}
                createdAt={review.created_at}
                reviewId={reviewId}
                reviewerImageUrl={review.reviewer_profile_image_url}
                reviewerName={review.reviewer_username || t('anonymous')}
                keywordReviewList={review.tags || []}
                content={review.content || ''}
                imageUrlList={review.image_urls || []}
                programId={review.program_id}
                companyId={review.company_id}
                programName={review.program_name}
                programPrice={review.program_price}
                programDurationMinutes={review.duration_minutes}
                programImageUrl={review.primary_image_url}
                onCardClick={() =>
                  router.push(`/${currentLocale}${ROUTES.COMPANY_REVIEWS(companyId)}`)
                }
                onReportClick={(targetReviewId) => {
                  setActiveReviewId(targetReviewId);
                  setActiveIsGuestReview(isGuestReview);
                  setIsReportOpen(true);
                }}
              />
            );
          })
        ) : (
          <Empty title={t('empty')} />
        )}
      </div>

      <div ref={loadMoreRef} css={bottom} />
      <ReasonModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setActiveReviewId(null);
          setActiveIsGuestReview(true);
        }}
        onSubmit={async ({ reason, detail }) => {
          if (!activeReviewId) return;
          try {
            const response = await (activeIsGuestReview
              ? reportGuestReviewMutation.mutateAsync({
                  reviewId: activeReviewId,
                  body: { reason, detail: detail || null },
                })
              : reportReviewMutation.mutateAsync({
                  reviewId: activeReviewId,
                  body: { reason, detail: detail || null },
                }));
            showToast({ title: response.message, icon: 'check' });
          } catch (error) {
            const status = error instanceof AxiosError ? error.response?.status : undefined;
            if (status === 401) {
              showToast({ title: t('report.errors.unauthorized'), icon: 'exclaim' });
            } else if (status === 403) {
              showToast({ title: t('report.errors.forbidden'), icon: 'exclaim' });
            } else if (status === 404) {
              showToast({ title: t('report.errors.notFound'), icon: 'exclaim' });
            } else if (status === 409) {
              showToast({ title: t('report.errors.duplicate'), icon: 'exclaim' });
            } else {
              showToast({ title: t('report.errors.failed'), icon: 'exclaim' });
            }
          } finally {
            setIsReportOpen(false);
            setActiveReviewId(null);
            setActiveIsGuestReview(true);
          }
        }}
      />
    </section>
  );
}
// todo: 스크롤 할 때 탭바 위치로 끌려가는 현상 수정하기
