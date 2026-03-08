import { Text } from '@/components';
import { ImageInput } from '@/components/image-input';
import { useTranslations } from 'next-intl';
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
const MAX_IMAGES = 5;

export function ReviewInputCard({
  reviewText,
  setReviewText,
  selectedImages,
  setSelectedImages,
}: ReviewInputCardProps) {
  const t = useTranslations('review-form');
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
      <Text typo="subtitle1">{t('title')}</Text>
      <div css={reviewImage}>
        <ImageInput
          maxLength={MAX_IMAGES}
          onChange={handleImageChange}
          onExceedMaxLength={(maxLength) => {
            alert(t('imageLimit', { count: maxLength }));
          }}
          defaultValue={selectedImages}
        />
      </div>
      <div css={reviewInput}>
        <textarea
          css={textarea}
          placeholder={t('placeholder')}
          maxLength={MAX_REVIEW_LENGTH}
          value={reviewText}
          onChange={handleTextChange}
        />
        <div css={textContainer}>
          <div css={errorText}>{showError && t('minLengthError')}</div>
          <div css={textCountContainer}>
            <span css={textCount(isTextValid)}>{reviewText.length}&nbsp;</span>
            <span css={textCountGray}> / {MAX_REVIEW_LENGTH} </span>
          </div>
        </div>
      </div>
    </div>
  );
}
