import { ImageInput, Text } from '@/components';
import {
  wrapper,
  reviewImage,
  reviewInput,
  textarea,
  textCount,
  textContainer,
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
      <Text typo="subtitle1">리뷰 작성</Text>
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
          <span css={textCount(reviewText.length > 0)}>{reviewText.length}&nbsp;</span>
          <span css={textCount(false)}> / 400 </span>
        </div>
      </div>
    </div>
  );
}
