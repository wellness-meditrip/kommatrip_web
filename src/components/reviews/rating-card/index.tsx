import { Text } from '@/components';
import { ReviewStars } from '@/components/review';
import { wrapper, stars } from './index.styles';

export function RatingCard({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (newRating: number) => void;
}) {
  return (
    <div css={wrapper}>
      <Text typo="subtitle1">서비스에 만족하셨나요?</Text>
      <Text typo="body11" color="gray500">
        별점을 채워주세요
      </Text>
      <div css={stars}>
        <ReviewStars rating={rating} onRatingChange={onRatingChange} />
      </div>
    </div>
  );
}
