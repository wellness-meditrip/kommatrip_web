import React from 'react';
import { ImageInput, Text } from '@/components';
import {
  wrapper,
  reviewImage,
  reviewInput,
  textarea,
  textCount,
  textCountGray,
  textContainer,
  errorText,
  textCountContainer,
} from './index.styles';

export function ReviewInputCard({
  reviewText,
  setReviewText,
  selectedImages,
  setSelectedImages,
}: {
  reviewText: string;
  setReviewText: (text: string) => void;
  selectedImages: File[];
  setSelectedImages: (images: File[]) => void;
}) {
  const handleImageChange = (files: File[]) => {
    setSelectedImages(files);
  };

  return (
    <div css={wrapper}>
      <Text typo="subtitle1">리뷰를 작성해주세요</Text>
      <div css={reviewImage}>
        <ImageInput maxLength={10} onChange={handleImageChange} defaultValue={selectedImages} />
      </div>
      <div css={reviewInput}>
        <textarea
          css={textarea}
          placeholder="리뷰를 작성해주세요"
          maxLength={400}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div css={textContainer}>
          <div css={errorText}>
            {reviewText.length > 0 && reviewText.length < 10 && '최소 10글자 이상 작성해주세요.'}
          </div>
          <div css={textCountContainer}>
            <span css={textCount(reviewText.length >= 10)}>{reviewText.length}&nbsp;</span>
            <span css={textCountGray}> / 400 </span>
          </div>
        </div>
      </div>
    </div>
  );
}
