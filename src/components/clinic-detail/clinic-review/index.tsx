import { useMemo } from 'react';
import { css } from '@emotion/react';
import { useRouter } from 'next/router';
import { AppBar, Empty, Layout, Text } from '@/components';
import { theme } from '@/styles';
import { Card } from '@/components/reviews/card';
import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';
import { useIntersectionLoad } from '@/hooks/review';
// import { getUserGroomerReviewListInfiniteQuery } from '~/queries';
import { ROUTES } from '@/constants/commons';
import { ReviewAi, ReviewTooltip } from '@/icons';

export function ClinicReview() {
  const router = useRouter();
  const { groomerId } = router.query;

  // 목업 데이터
  const MOCK_REVIEWS = [
    {
      groomingReviewId: 1,
      reviewerName: '홍길동',
      reviewerImageUrl: '/images/mock-user.png',
      groomingKeywordList: ['CUSTOMIZED_CARE', 'THOROUGH_TREATMENT'],
      starRating: 3 as 1 | 2 | 3 | 4 | 5,
      content:
        '진료를 하루에 최대 5명까지만 하신대요. 그래서 한명 한명 정성스럽게 진료해주세요. 진료 시간이 긴 만큼 섬세하게 진료해주시고, 전후 차이도 바로 확인할 수 있어서 좋습니다. 다음에 또 원장님께 진료 받고 싶어용🥰',
      imageUrlList: ['/images/mock-review1.png', '/images/mock-review2.png'],
      createdAt: '2025-08-01T12:00:00',
    },
    {
      groomingReviewId: 2,
      reviewerName: '김철수',
      reviewerImageUrl: '/images/mock-user2.png',
      groomingKeywordList: ['INTERPRETER_AVAILABLE', 'AFTERCARE_DETAIL'],
      starRating: 5 as 1 | 2 | 3 | 4 | 5,
      content:
        '첫 방문이었는데, 너무 친절하셔서 재방문 의사가 있습니다. 개인당 진료시간이 여유로워서 공장형으로 진료하는 곳들과 달랐어요. ',
      imageUrlList: [],
      createdAt: '2025-08-02T15:30:00',
    },
  ];

  function getUserGroomerReviewListInfiniteQuery(_groomerId: number) {
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
    getUserGroomerReviewListInfiniteQuery(Number(groomerId));

  const reviewCount = useMemo(() => data?.pages[0]?.reviewCount, [data]);

  const { loadMoreRef } = useIntersectionLoad({ fetchNextPage, hasNextPage, isFetchingNextPage });

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
              <Text tag="p" typo="body_S" color="text_secondary">
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
          이것은 리뷰 요약 기능 ~!
        </Text>
      </div>
      <Text tag="h1" typo="body_M" color="text_secondary" css={count}>
        {`리뷰 ${reviewCount ?? 0}개`}
      </Text>

      <div css={content}>
        {data?.pages.map((page) =>
          page.reviewCount > 0 ? (
            page.reviewList.map(
              ({
                groomingReviewId,
                reviewerName,
                reviewerImageUrl,
                groomingKeywordList,
                starRating,
                content,
                imageUrlList,
                createdAt,
              }) => (
                <Card
                  key={groomingReviewId}
                  createdAt={createdAt}
                  reviewId={groomingReviewId}
                  reviewerImageUrl={reviewerImageUrl}
                  reviewerName={reviewerName}
                  keywordReviewList={groomingKeywordList
                    .map((keyword) => CLINIC_REVIEW_KEYWORDS[keyword])
                    .filter((keyword): keyword is string => !!keyword)}
                  starRating={starRating}
                  content={content}
                  imageUrlList={imageUrlList}
                />
              )
            )
          ) : (
            <Empty title="아직 받은 리뷰가 없어요" />
          )
        )}
      </div>

      <div ref={loadMoreRef} css={bottom} />
    </section>
  );
}

const wrapper = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: hidden;
  gap: 16px;

  background: ${theme.colors.bg_surface1};
  h1 {
    margin: 0 20px;
  }
`;

const reviewSummary = css`
  display: flex;
  flex-direction: column;
  margin: 20px 20px 0;
  padding: 12px 16px;
  border-radius: 8px;
  gap: 8px;
  background: ${theme.colors.white};
`;

const titleWrapper = css`
  display: flex;
  justify-content: space-between;
`;
const title = css`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const toolTip = css`
  display: flex;
  position: relative;
  gap: 4px;

  cursor: pointer;

  &:hover > div {
    opacity: 1;

    visibility: visible;
  }
`;

const toolTipInfo = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: absolute;
  top: calc(100% + 8px);
  left: 100px;
  transform: translateX(-103%);
  z-index: 2;
  visibility: hidden;

  width: 322px;
  padding: 16px;
  border-radius: 8px;

  background-color: white;
  box-shadow: 0 0 6px rgb(0 0 6 / 10%);

  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
  opacity: 0;
`;

const list = css`
  padding-left: 16px;
  margin: 0;

  li {
    margin-bottom: 4px;
    list-style-type: disc;
  }
`;
const content = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;

  width: 100%;
  height: 100%;
  padding: 0 20px 20px;
  border-top: 1px solid ${theme.colors.gray200};
`;

const count = css`
  padding: 12px 16px;
  border-radius: 8px;
  background: ${theme.colors.white};
`;
export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
