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
      <Text typo="title_M">진료 정보</Text>
      <div css={reviewImage}>
        <ImageInput maxLength={10} onChange={handleImageChange} defaultValue={selectedImages} />
      </div>
      <div css={reviewInput}>
        <div>
          <Text typo="title_S">주요 증상 및 진료 목적 *</Text>
        </div>
        <textarea
          css={textarea}
          placeholder="진료 받고 싶은 증상이나 목적을 작성해주세요"
          maxLength={400}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div>
          <Text typo="title_S">복용 중인 약물</Text>
        </div>
        <textarea
          css={textarea}
          placeholder="복용 중인 약물이 있다면 작성해주세요"
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
