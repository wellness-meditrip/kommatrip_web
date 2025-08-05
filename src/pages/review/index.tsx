// pages/review.tsx

import { useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast } from '@/hooks';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { KeywordCard, PartnersCard, RatingCard, ReviewInputCard } from '@/components/reviews';

import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';
import { ROUTES } from '@/constants/commons';

const mockData = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
};

const getKeywordsByService = (service: string | undefined): string[] => {
  return Object.values(CLINIC_REVIEW_KEYWORDS).flat();
};

export default function ReviewPage() {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const router = useRouter();
  const { service = 'vet' } = router.query;

  const keywords = getKeywordsByService(service as string);

  const partnersCardData = {
    partnerName: mockData.recipientName,
    shopName: mockData.shopName,
    schedule: dayjs(mockData.schedule).locale('ko').format('YYYY.MM.DD(ddd) • HH:mm'),
  };

  const { showToast } = useToast();

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!rating || !reviewText) {
      alert('별점과 리뷰 내용을 입력해주세요.');
      return;
    }

    // 이미지 업로드 로직 생략 (mock 처리)
    const uploadedImageUrls = selectedImages.map((file, index) => URL.createObjectURL(file));

    console.log('✅ 등록된 리뷰:', {
      reservationId: 1,
      starRating: rating,
      keywordList: selectedTags,
      content: reviewText,
      imageUrlList: uploadedImageUrls,
    });

    showToast({ title: '리뷰가 성공적으로 등록되었습니다!' });
    router.push(ROUTES.MYPAGE_PAYMENTS); // 리뷰 완료 후 이동
  };

  return (
    <Layout>
      <AppBar onBackClick={router.back} showBackButton={true} title="리뷰작성" />
      <div css={wrapper}>
        <div css={header}>
          <Text typo="title1">
            {service === 'vet' ? partnersCardData.partnerName : partnersCardData.shopName}
          </Text>
        </div>
        <div css={container}>
          <PartnersCard
            partnerName={partnersCardData.partnerName}
            shopName={partnersCardData.shopName}
            schedule={partnersCardData.schedule}
          />

          <RatingCard rating={rating} onRatingChange={setRating} />

          <KeywordCard
            tags={keywords}
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
            disabled={!rating || !reviewText || selectedTags.length === 0}
          >
            리뷰 등록하기
          </RoundButton>
        </div>
      </div>
    </Layout>
  );
}

const wrapper = css`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.bg_surface1};
`;

const header = css`
  margin-bottom: 6px;
  padding: 18px;

  background-color: ${theme.colors.white};
`;

const container = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 18px 18px;
`;

const submitButton = css`
  margin-top: 14px;
  padding: 18px;
`;
