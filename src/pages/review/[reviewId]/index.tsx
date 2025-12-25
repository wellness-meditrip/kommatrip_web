import { useState, useEffect } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog } from '@/hooks';
import { useRouter } from 'next/router';
import Image from 'next/image';
import 'dayjs/locale/ko';
import { useTranslations } from 'next-intl';
import {
  wrapper,
  header,
  content,
  item,
  image,
  container,
  submitButton,
} from '@/styles/pages/review.styles';
import { KeywordCard, RatingCard, ReviewInputCard } from '@/components/reviews';
import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';
import { useGetReviewDetailQuery, usePutReviewMutation } from '@/queries';
import { Loading } from '@/components/common';

const mockData = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
};

export default function ReviewEditPage() {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const router = useRouter();
  const t = useTranslations('review');
  const { showToast } = useToast();
  const { open } = useDialog();

  // URL에서 review_id 가져오기
  const reviewId = Number(router.query.reviewId);

  // 리뷰 상세 조회
  const { data: reviewData, isLoading: isLoadingReview } = useGetReviewDetailQuery(reviewId);

  // 리뷰 수정 mutation
  const { mutate: putReview, isPending: isUpdating } = usePutReviewMutation();

  const keywordNames = CLINIC_REVIEW_KEYWORDS.map((k) => k.keyword_name);
  // const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 리뷰 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (reviewData) {
      setRating(reviewData.rating);
      setReviewText(reviewData.content);
      setSelectedTags(reviewData.keywords.map((k) => k.keyword_name));
    }
  }, [reviewData]);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!reviewData) return;

    if (reviewText.length < 10) {
      alert(t('minLengthAlert'));
      return;
    }

    const body = {
      title: reviewData.title,
      content: reviewText,
      rating,
      doctor_id: reviewData.doctor_id,
      doctor_name: reviewData.doctor_name,
    };

    putReview(
      { reviewId, body },
      {
        onSuccess: () => {
          showToast({ title: t('updateSuccess') });
        },
        onError: (error: unknown) => {
          let errorMessage = t('unknownError');

          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: unknown; status?: number } };

            if (axiosError.response?.status === 422) {
              errorMessage = t('invalidInput');
              if (
                axiosError.response?.data &&
                typeof axiosError.response.data === 'object' &&
                'message' in axiosError.response.data
              ) {
                errorMessage = String(axiosError.response.data.message);
              }
            } else if (axiosError.response?.status === 401) {
              errorMessage = t('loginRequired');
            } else if (axiosError.response?.status === 403) {
              errorMessage = t('forbidden');
            }
          }

          open({
            type: 'confirm',
            title: t('updateFail'),
            description: errorMessage,
            primaryActionLabel: t('confirm'),
          });
        },
      }
    );
  };

  return (
    <Layout>
      <AppBar onBackClick={router.back} leftButton={true} title={t('editTitle')} />
      <div css={wrapper}>
        <div css={header}>
          <Image src="/default.png" alt="기본 이미지" width={72} height={72} css={image} />
          <div css={content}>
            <Text typo="title_M">{mockData.recipientName}</Text>
            <div>
              <div css={item}>
                <Text typo="body_M" color="text_tertiary">
                  {t('serviceItem')}
                </Text>
                <Text typo="button_M" color="text_secondary">
                  {mockData.shopName}
                </Text>
              </div>
              <div css={item}>
                <Text typo="body_M" color="text_tertiary">
                  {t('visitDate')}
                </Text>
                <Text typo="button_M" color="text_secondary">
                  {mockData.schedule}
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div css={container}>
          {(isLoadingReview || isUpdating) && (
            <Loading title={isLoadingReview ? t('loading') : t('updating')} />
          )}

          <RatingCard rating={rating} onRatingChange={setRating} />

          <KeywordCard
            tags={keywordNames}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
          />

          <ReviewInputCard
            reviewText={reviewText}
            setReviewText={setReviewText}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
        </div>
        <div css={submitButton}>
          <RoundButton
            service="daengle"
            size="L"
            fullWidth
            onClick={handleSubmit}
            disabled={
              !rating || !reviewText || selectedTags.length === 0 || isUpdating || isLoadingReview
            }
          >
            {isUpdating ? t('updatingButton') : t('updateButton')}
          </RoundButton>
        </div>
      </div>
    </Layout>
  );
}
