import { useMemo } from 'react';
import { Empty, Text, Loading } from '@/components';
import { Card } from '@/components/reviews/card';
import { useIntersectionLoad } from '@/hooks/review';
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

interface CompanyReviewProps {
  companyId: number;
}

export function CompanyReview({ companyId }: CompanyReviewProps) {
  const router = useRouter();
  const t = useTranslations('review');
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
            <Text tag="p" typo="button_S" color="text_tertiary">
              {t('aiSummaryBy')}
            </Text>
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
          reviewList.map((review) => (
            <Card
              key={review.id}
              createdAt={review.created_at}
              reviewId={review.id}
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
              onCardClick={() => router.push(ROUTES.COMPANY_REVIEWS(companyId))}
            />
          ))
        ) : (
          <Empty title={t('empty')} />
        )}
      </div>

      <div ref={loadMoreRef} css={bottom} />
    </section>
  );
}
// todo: 스크롤 할 때 탭바 위치로 끌려가는 현상 수정하기
