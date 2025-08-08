import { CapsuleButton, Rating, Text } from '@/components';
import {
  wrapper,
  userImage,
  userInfo,
  reviewerInfo,
  reviewImages,
  contentContainer,
  contentStyle,
  contentUnrolled,
  unroll,
  report,
  tagsWrapper,
  tagWrapper,
} from './index.styles';

import { ButtonTextButtonArrow, DefaultImage, ReviewFold, ReviewUnfold } from '@/icons';
import { useState } from 'react';
interface PartnersReviewListType {
  reviewId: number;
  userId: number;
  keywordsList: string[];
  reviewerName: string;
  reviewerImageUrl: string;
  revieweeName: string;
  createdAt: string;
  starRating: 1 | 2 | 3 | 4 | 5;
  content: string;
  imageUrlList: string[];
  reportType?: string;
  reportContent?: string;
}

interface Props<T extends PartnersReviewListType> {
  review: T;
  flagged?: boolean;
  reportType?: string;
  reportContent?: string;
  onReport: (event: React.MouseEvent<HTMLButtonElement>, reviewId: number, userId: number) => void;
}

export function ReviewCard<T extends PartnersReviewListType>({
  review,
  flagged = false,
  onReport,
}: Props<T>) {
  const {
    reviewerImageUrl,
    reviewerName,
    starRating,
    imageUrlList,
    keywordsList,
    content,
    reportType,
    reportContent,
  } = review;
  const [isUnrolled, setIsUnrolled] = useState(false);

  function handleCheckAllContent() {
    setIsUnrolled(!isUnrolled);
  }

  const [isImageError, setIsImageError] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsImageError(true);
  };

  return (
    <div css={wrapper}>
      <div css={reviewerInfo}>
        <div css={userInfo}>
          {!isImageError && reviewerImageUrl ? (
            <img
              src={reviewerImageUrl}
              alt={`${reviewerName} 프로필`}
              css={userImage}
              onError={handleImageError}
            />
          ) : (
            <DefaultImage css={userImage} />
          )}
          <Text typo="subtitle2">{reviewerName}</Text>
          <Rating size="S" rate={starRating} />
        </div>
        {!flagged && (
          <CapsuleButton onClick={(event) => onReport(event, review.reviewId, review.userId)}>
            신고하기
          </CapsuleButton>
        )}
      </div>
      <div css={reviewImages}>
        {imageUrlList.map((image, index) => (
          <img key={index} src={image} alt={`리뷰 이미지 ${index + 1}`} />
        ))}
      </div>
      <div css={tagsWrapper}>
        {keywordsList.length > 0 &&
          keywordsList.map((tag) => (
            <div key={tag} css={tagWrapper}>
              <Text typo="body12" color="blue200">
                {`#${tag}`}
              </Text>
            </div>
          ))}
      </div>
      <div css={contentContainer}>
        <Text
          typo="body11"
          css={[contentStyle(flagged, isUnrolled), isUnrolled && contentUnrolled]}
        >
          {content}
        </Text>
        {!isUnrolled && flagged && (
          <ButtonTextButtonArrow width={6} onClick={handleCheckAllContent} />
        )}
      </div>
      {flagged && (
        <>
          <Text typo="subtitle1" css={report}>
            신고 유형
          </Text>
          <Text typo="body11" color="gray500">
            {reportType}
          </Text>
          <Text typo="subtitle1" css={report}>
            신고 내용
          </Text>
          <Text typo="body11" color="gray500">
            {reportContent}
          </Text>
        </>
      )}
      {!flagged && (
        <button css={unroll} onClick={() => setIsUnrolled(!isUnrolled)}>
          {isUnrolled ? (
            <ReviewFold width={12} height={6} />
          ) : (
            <ReviewUnfold width={12} height={6} />
          )}
        </button>
      )}
    </div>
  );
}
