import { useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog } from '@/hooks';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { convertKeywordNamesToRequestPayload } from '@/utils';
import {
  wrapper,
  header,
  content,
  item,
  image,
  container,
  loadingContainer,
  submitButton,
} from '@/styles/pages/review.styles';
import { KeywordCard, RatingCard, ReviewInputCard } from '@/components/reviews';
import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';
import { usePostClinicReviewMutation } from '@/queries';
import { Loading } from '@/components/common';
import { useS3 } from '@/hooks/use-s3';

const MOCK_DATA = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
} as const;

const MOCK_RESERVATION_DATA = {
  hospital_id: 1,
  user_id: 1,
  doctor_id: 1,
  doctor_name: '홍길동',
  partnerName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
} as const;

export default function ReviewPage() {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const router = useRouter();
  const { showToast } = useToast();
  const { open } = useDialog();
  const { mutate, isPending } = usePostClinicReviewMutation();
  const { uploadToS3 } = useS3({ targetFolderPath: 'user/review-images' });

  const keywordNames = CLINIC_REVIEW_KEYWORDS.map((k) => k.keyword_name);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const validateForm = () => {
    if (!rating || !reviewText || selectedTags.length === 0) {
      alert('별점, 키워드, 내용을 모두 입력해주세요.');
      return false;
    }

    if (reviewText.length < 10) {
      alert('리뷰는 최소 10글자 이상 작성해주세요.');
      return false;
    }

    return true;
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    try {
      return await uploadToS3(selectedImages);
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
      throw error;
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number } };

      if (axiosError.response?.status === 422) {
        if (
          axiosError.response?.data &&
          typeof axiosError.response.data === 'object' &&
          'message' in axiosError.response.data
        ) {
          return String(axiosError.response.data.message);
        }
        return '입력하신 정보를 확인해주세요.';
      } else if (axiosError.response?.status === 401) {
        return '로그인이 필요합니다.';
      } else if (axiosError.response?.status === 403) {
        return '접근 권한이 없습니다.';
      }
    }
    return '알 수 없는 오류가 발생했습니다.';
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const imageUrls = await uploadImages();
      const mappedKeywords = convertKeywordNamesToRequestPayload(selectedTags);

      const body = {
        hospital_id: MOCK_RESERVATION_DATA.hospital_id,
        user_id: MOCK_RESERVATION_DATA.user_id,
        doctor_id: MOCK_RESERVATION_DATA.doctor_id,
        doctor_name: MOCK_RESERVATION_DATA.doctor_name,
        title: `${MOCK_RESERVATION_DATA.shopName} 후기`,
        content: reviewText,
        rating,
        keywords: mappedKeywords,
        images: imageUrls,
      };

      mutate(body, {
        onSuccess: () => {
          showToast({ title: '리뷰가 성공적으로 등록되었습니다!' });
          // 성공 시 마이페이지로 이동
          router.push('/mypage');
        },
        onError: (error: unknown) => {
          const errorMessage = getErrorMessage(error);
          open({
            type: 'confirm',
            title: '리뷰 등록 실패',
            description: errorMessage,
            primaryActionLabel: '확인',
          });
        },
      });
    } catch {
      // 이미지 업로드 실패 시 여기서 처리됨
    }
  };

  return (
    <Layout>
      <AppBar onBackClick={router.back} leftButton={true} title="리뷰 작성" />
      <div css={wrapper}>
        <div css={header}>
          <Image src="/default.png" alt="기본 이미지" width={72} height={72} css={image} />
          <div css={content}>
            <Text typo="title_M">{MOCK_DATA.recipientName}</Text>
            <div>
              <div css={item}>
                <Text typo="body_M" color="text_tertiary">
                  진료항목
                </Text>
                <Text typo="button_M" color="text_secondary">
                  {MOCK_DATA.shopName}
                </Text>
              </div>
              <div css={item}>
                <Text typo="body_M" color="text_tertiary">
                  방문일자
                </Text>
                <Text typo="button_M" color="text_secondary">
                  {MOCK_DATA.schedule}
                </Text>
              </div>
            </div>
          </div>
        </div>
        {isPending ? (
          <div css={loadingContainer}>
            <Loading title="리뷰를 등록하고 있어요" fullHeight={true} />
          </div>
        ) : (
          <>
            <div css={container}>
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
                disabled={!rating || !reviewText || selectedTags.length === 0}
              >
                리뷰 등록하기
              </RoundButton>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
