import { Empty } from '@/components';
import { ReviewCard } from '../card';
import { wrapper, empty } from './index.styles';
import { useTranslations } from 'next-intl';
export interface PartnersReviewListType {
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
  reviews: T[];
  flagged?: boolean;
  onReport: (reviewId: number, userId: number) => void;
}

export function ReviewCardList<T extends PartnersReviewListType>({
  reviews,
  flagged,
  onReport,
}: Props<T>) {
  const t = useTranslations('review');
  if (reviews.length === 0) {
    return (
      <div css={empty}>
        <Empty title={t('emptyReceived')} />
      </div>
    );
  }
  return (
    <div css={wrapper}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.reviewId}
          review={review}
          flagged={flagged}
          onReport={(event) => {
            event.preventDefault();
            onReport(review.reviewId, review.userId);
          }}
        />
      ))}
    </div>
  );
}
