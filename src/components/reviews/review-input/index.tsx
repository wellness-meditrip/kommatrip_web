import { Text } from '@/components';
import { ImageInput } from '@/components/image-input';
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

interface ReviewInputCardProps {
  reviewText: string;
  setReviewText: (text: string) => void;
  selectedImages: File[];
  setSelectedImages: (images: File[]) => void;
}

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 400;
const MAX_IMAGES = 10;

export function ReviewInputCard({
  reviewText,
  setReviewText,
  selectedImages,
  setSelectedImages,
}: ReviewInputCardProps) {
  const handleImageChange = (files: File[]) => {
    setSelectedImages(files);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value);
  };

  const showError = reviewText.length > 0 && reviewText.length < MIN_REVIEW_LENGTH;
  const isTextValid = reviewText.length >= MIN_REVIEW_LENGTH;

  return (
    <div css={wrapper}>
      <Text typo="subtitle1">리뷰를 작성해주세요</Text>
      <div css={reviewImage}>
        <ImageInput
          maxLength={MAX_IMAGES}
          onChange={handleImageChange}
          defaultValue={selectedImages}
        />
      </div>
      <div css={reviewInput}>
        <textarea
          css={textarea}
          placeholder="리뷰를 작성해주세요"
          maxLength={MAX_REVIEW_LENGTH}
          value={reviewText}
          onChange={handleTextChange}
        />
        <div css={textContainer}>
          <div css={errorText}>{showError && '최소 10글자 이상 작성해주세요.'}</div>
          <div css={textCountContainer}>
            <span css={textCount(isTextValid)}>{reviewText.length}&nbsp;</span>
            <span css={textCountGray}> / {MAX_REVIEW_LENGTH} </span>
          </div>
        </div>
      </div>
    </div>
  );
}
