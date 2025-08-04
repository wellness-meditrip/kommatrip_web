import { useState } from 'react';
import Image from 'next/image';
import { Rating, Text } from '@/components';
import { DefaultImage, ReviewFold, ReviewUnfold } from '@/icons';
import {
  clampText,
  reviewerInfo,
  imageWrapper,
  contentWrapper,
  tagsWrapper,
  tagWrapper,
  wrapper,
  top,
  topLeft,
} from './index.styles';
import dayjs from 'dayjs';

interface Props {
  reviewId: number;
  reviewerName: string;
  reviewerImageUrl: string | null;
  keywordReviewList: string[];
  starRating: 1 | 2 | 3 | 4 | 5;
  content: string | null;
  imageUrlList: string[] | null;
  createdAt: string;
}

export function Card({
  keywordReviewList,
  reviewerName,
  reviewerImageUrl,
  starRating,
  content,
  imageUrlList,
  createdAt,
}: Props) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div css={wrapper}>
      <div css={top}>
        <div css={topLeft}>
          <div css={reviewerInfo}>
            {reviewerImageUrl ? (
              <Image src={reviewerImageUrl} alt="리뷰 작성자 이미지" width={50} height={50} />
            ) : (
              <DefaultImage width={50} height={50} />
            )}
            <Text typo="title_S" color="black">
              {reviewerName}
            </Text>
          </div>
          <Rating rate={starRating} />
        </div>
        <Text typo="title_S" color="gray200">
          {dayjs(createdAt).format('YYYY.MM.DD')}
        </Text>
      </div>

      {imageUrlList && !!imageUrlList?.length && (
        <div css={imageWrapper}>
          {imageUrlList?.map((url) => (
            <Image key={url} src={url} alt="리뷰 이미지" width={120} height={120} />
          ))}
        </div>
      )}

      {content && (
        <>
          <Text
            tag="p"
            typo="body_M"
            color="text_secondary"
            css={[contentWrapper, !isExpanded && clampText]}
          >
            {content}
          </Text>

          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ReviewFold width="6px" /> : <ReviewUnfold width="6px" />}
          </button>
        </>
      )}
      <div css={tagsWrapper}>
        {keywordReviewList.length > 0 &&
          keywordReviewList.map((tag) => (
            <div key={tag} css={tagWrapper}>
              <Text typo="body_S" color="text_tertiary">
                {`${tag}`}
              </Text>
            </div>
          ))}
      </div>
    </div>
  );
}
