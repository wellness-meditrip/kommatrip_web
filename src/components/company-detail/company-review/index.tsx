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

interface CompanyReviewProps {
  companyId: number;
}

export function CompanyReview({ companyId }: CompanyReviewProps) {
  const router = useRouter();
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
              by Gemini
            </Text>
            <div css={toolTipInfo}>
              <Text typo="body_S" color="text_secondary">
                <ul css={list}>
                  <li>인공지능 GPT-4로 리뷰를 분석해 생성한 리뷰 요약입니다.</li>
                  <li>개인이 작성한 한 줄 리뷰는 안전하게 관리되며 리뷰 요약 글에만 사용됩니다.</li>
                  <li>메디트립은 개별 리뷰의 진실성을 보증하지 않습니다.</li>
                  <li>리뷰 데이터가 충분하지 않을 경우, AI 리뷰가 노출되지 않을 수 있습니다.</li>
                </ul>
              </Text>
            </div>
          </div>
        </div>

        <Text typo="body_M" color="text_secondary">
          {/* {aiSummary} */}
          We’re gathering more reviews...
        </Text>
      </div>

      <div css={content}>
        {isLoading ? (
          <Loading title="리뷰를 불러오는 중..." />
        ) : reviewList.length > 0 ? (
          reviewList.map((review) => (
            <Card
              key={review.id}
              createdAt={review.created_at}
              reviewId={review.id}
              reviewerImageUrl={review.reviewer_profile_image_url}
              reviewerName={review.reviewer_username || '익명'}
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
          <Empty title="아직 받은 리뷰가 없어요" />
        )}
      </div>

      <div ref={loadMoreRef} css={bottom} />
    </section>
  );
}
// todo: 스크롤 할 때 탭바 위치로 끌려가는 현상 수정하기
