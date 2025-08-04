import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@/components';
import { Card } from '@/components/reviews/card';
import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';
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
  count,
  content,
  bottom,
} from './index.styles';
// import { getUserGroomerReviewListInfiniteQuery } from '~/queries';

export function ClinicReview() {
  // 목업 데이터
  const MOCK_REVIEWS = [
    {
      clinicReviewId: 1,
      reviewerName: '홍길동',
      reviewerImageUrl: '/images/mock-user.png',
      clinicKeywordList: ['CUSTOMIZED_CARE', 'THOROUGH_TREATMENT'],
      starRating: 3 as 1 | 2 | 3 | 4 | 5,
      content:
        '진료를 하루에 최대 5명까지만 하신대요. 그래서 한명 한명 정성스럽게 진료해주세요. 진료 시간이 긴 만큼 섬세하게 진료해주시고, 전후 차이도 바로 확인할 수 있어서 좋습니다. 다음에 또 원장님께 진료 받고 싶어용🥰',
      imageUrlList: ['/images/mock-review1.png', '/images/mock-review2.png'],
      createdAt: '2025-08-01T12:00:00',
    },
    {
      clinicReviewId: 2,
      reviewerName: '김철수',
      reviewerImageUrl: '/images/mock-user2.png',
      clinicKeywordList: ['INTERPRETER_AVAILABLE', 'AFTERCARE_DETAIL'],
      starRating: 5 as 1 | 2 | 3 | 4 | 5,
      content:
        '첫 방문이었는데, 너무 친절하셔서 재방문 의사가 있습니다. 개인당 진료시간이 여유로워서 공장형으로 진료하는 곳들과 달랐어요. ',
      imageUrlList: [],
      createdAt: '2025-08-02T15:30:00',
    },
  ];

  function getUserGroomerReviewListInfiniteQuery() {
    return {
      data: {
        pages: [
          {
            reviewCount: MOCK_REVIEWS.length,
            reviewList: MOCK_REVIEWS,
          },
        ],
      },
      fetchNextPage: () => {},
      hasNextPage: false,
      isFetchingNextPage: false,
    };
  }
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    getUserGroomerReviewListInfiniteQuery();

  const reviewCount = useMemo(() => data?.pages[0]?.reviewCount, [data]);

  const { loadMoreRef } = useIntersectionLoad({ fetchNextPage, hasNextPage, isFetchingNextPage });

  // AI 요약
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsSummaryLoading(true);
      setSummaryError(false);
      try {
        const res = await fetch('/api/gemini');
        const json = await res.json();
        setAiSummary(json.summary ?? null);
      } catch (err) {
        console.error('AI 요약 호출 실패', err);
        setSummaryError(true);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchSummary();
  }, []);

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
        {data?.pages.map((page) =>
          page.reviewCount > 0 ? (
            page.reviewList.map(
              ({
                clinicReviewId,
                reviewerName,
                reviewerImageUrl,
                clinicKeywordList,
                starRating,
                content,
                imageUrlList,
                createdAt,
              }) => (
                <Card
                  key={clinicReviewId}
                  createdAt={createdAt}
                  reviewId={clinicReviewId}
                  reviewerImageUrl={reviewerImageUrl}
                  reviewerName={reviewerName}
                  keywordReviewList={clinicKeywordList
                    .map((keyword) => CLINIC_REVIEW_KEYWORDS[keyword])
                    .filter((keyword): keyword is string => !!keyword)}
                  starRating={starRating}
                  content={content}
                  imageUrlList={imageUrlList}
                />
              )
            )
          ) : (
            <p> 아직 받은 리뷰가 없어요.</p>
            // <Empty key="empty" title="아직 받은 리뷰가 없어요" />
          )
        )}
      </div>

      <div ref={loadMoreRef} css={bottom} />
    </section>
  );
}
