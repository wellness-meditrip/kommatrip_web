import { useState } from 'react';
import { Empty, Text } from '@/components';
import { Card } from '@/components/reviews/card';
// import { useIntersectionLoad } from '@/hooks/review';
import { ReviewAi, ReviewTooltip } from '@/icons';
import {
  wrapper,
  reviewSummary,
  titleWrapper,
  title,
  toolTip,
  toolTipInfo,
  list,
  count,
  content,
  bottom,
} from './index.styles';
// import { useGetClinicReviewInfiniteQuery } from '@/queries/review';
import { mockReviewData, mockReviewSummary } from '@/data/mock-review-data';

export function CompanyReview() {
  // API 호출 부분 주석처리
  // const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  //   useGetCompanyReviewInfiniteQuery(companyId);

  // 목업데이터로 교체
  const reviewCount = mockReviewData.length;
  const reviewList = mockReviewData;
  const loadMoreRef = null;

  // AI 요약 - 목업데이터로 교체
  const [aiSummary] = useState<string | null>(mockReviewSummary);

  // API 호출 부분 주석처리
  // useEffect(() => {
  //   const fetchSummary = async () => {
  //     setIsSummaryLoading(true);
  //     setSummaryError(false);
  //     try {
  //       const res = await fetch('/api/gemini');
  //       const json = await res.json();
  //       setAiSummary(json.summary ?? null);
  //     } catch (err) {
  //       console.error('AI 요약 호출 실패', err);
  //       setSummaryError(true);
  //     } finally {
  //       setIsSummaryLoading(false);
  //     }
  //   };

  //   fetchSummary();
  // }, []);

  return (
    <section css={wrapper}>
      <div css={reviewSummary}>
        <div css={titleWrapper}>
          <div css={title}>
            <ReviewAi width="14" height="14" />
            <Text tag="p" typo="button_S" color="primary30">
              AI 리뷰 요약 불러오기
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

        {isSummaryLoading ? (
          <Text typo="body_M" color="text_secondary">
            AI 요약을 불러오는 중...
          </Text>
        ) : summaryError ? (
          <Text typo="body_M" color="text_secondary">
            요약을 불러오는 데 실패했습니다.
          </Text>
        ) : aiSummary ? (
          <Text typo="body_M" color="text_secondary">
            {aiSummary}
          </Text>
        ) : (
          <Text typo="body_M" color="text_secondary">
            요약이 준비되지 않았습니다.
          </Text>
        )}
      </div>
      <Text tag="h1" typo="body_M" color="text_secondary" css={count}>
        {`리뷰 ${reviewCount ?? 0}개`}
      </Text>

      <div css={content}>
        {reviewList.length > 0 ? (
          reviewList.map((review) => (
            <Card
              key={review.review_id}
              createdAt={review.created_at}
              reviewId={review.review_id}
              reviewerImageUrl="/public/images/mock-user.png" // 현재 reviewerImageUrl 정보 없음
              reviewerName={review.doctor_name} // 현재 reviewerName 정보 없음
              keywordReviewList={[]} // 현재 keyword 정보 없음
              starRating={review.rating as 1 | 2 | 3 | 4 | 5}
              content={review.content ?? ''}
              imageUrlList={[]} // 현재 imageUrlList 정보 없음
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
// todo: Card 컴포넌트에 keywordReviewList 수정하기
//  keywordReviewList={clinicKeywordList
//                     .map((keyword) => CLINIC_REVIEW_KEYWORDS[keyword])
//                     .filter((keyword): keyword is string => !!keyword)}
