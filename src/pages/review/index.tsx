import { useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog } from '@/hooks';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { convertKeywordNamesToRequestPayload, extractMultipleImageMetadata } from '@/utils';
import 'dayjs/locale/ko';
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
import { usePostClinicReviewMutation } from '@/queries';
import { ImageMetadata } from '@/models/review';
import { Loading } from '@/components/common';

const mockData = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
};

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
  const keywordNames = CLINIC_REVIEW_KEYWORDS.map((k) => k.keyword_name);
  // const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  // useEffect(() => {
  //   const raw = localStorage.getItem('userInfo');
  //   console.log('[🧾 raw userInfo from localStorage]', raw);
  //   try {
  //     if (!raw) {
  //       alert('❌ userInfo 없음: RN에서 아직 전달되지 않음');
  //       return;
  //     }

  //     const parsed: UserInfo = JSON.parse(raw);
  //     // setUserInfo(parsed);
  //     console.log('[✅ 파싱된 userInfo 객체]', parsed);

  //     // ✅ RN이 잘 전달해줬는지 확인
  //     alert(
  //       `🧑‍💻 유저 정보 확인:\n` +
  //         `닉네임: ${parsed.nickname}\n` +
  //         `이메일: ${parsed.email}\n` +
  //         `ID: ${parsed.id}`
  //     );
  //   } catch (e) {
  //     console.error('userInfo 파싱 실패', e);
  //     alert('❌ userInfo 파싱 실패: RN에서 잘못된 값이 전달됨');
  //   }
  // }, []);

  const handleSubmit = async () => {
    if (!rating || !reviewText || selectedTags.length === 0) {
      alert('별점, 키워드, 내용을 모두 입력해주세요.');
      return;
    }

    if (reviewText.length < 10) {
      alert('리뷰는 최소 10글자 이상 작성해주세요.');
      return;
    }

    let imageMetadata: ImageMetadata[] = [];
    if (selectedImages.length > 0) {
      try {
        const metadata = await extractMultipleImageMetadata(selectedImages, 1);
        imageMetadata = metadata.map((item) => ({
          image_data: item.image_data,
          image_type: item.image_type,
          original_filename: item.original_filename,
          file_size: item.file_size,
          width: item.width,
          height: item.height,
          image_order: item.image_order,
          alt_text: item.alt_text || '',
        }));
      } catch {
        alert('이미지 처리에 실패했습니다.');
        return;
      }
    }

    const mappedKeywords = convertKeywordNamesToRequestPayload(selectedTags);
    const mockReservationData = {
      hospital_id: 1,
      user_id: 1,
      doctor_id: 1,
      doctor_name: '홍길동',
      partnerName: '우주연 한의원',
      shopName: '다이어트 패키지',
      schedule: '2025-08-02T14:00:00',
    };
    const body = {
      hospital_id: mockReservationData.hospital_id,
      user_id: mockReservationData.user_id,
      doctor_id: mockReservationData.doctor_id,
      doctor_name: mockReservationData.doctor_name,
      title: `${mockReservationData.shopName} 후기`,
      content: reviewText,
      rating,
      keywords: mappedKeywords,
      images: imageMetadata,
    };

    mutate(body, {
      onSuccess: () => {
        showToast({ title: '리뷰가 성공적으로 등록되었습니다!' });
      },
      onError: (error: unknown) => {
        let errorMessage = '알 수 없는 오류가 발생했습니다.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: unknown; status?: number } };

          if (axiosError.response?.status === 422) {
            errorMessage = '입력하신 정보를 확인해주세요.';
            if (
              axiosError.response?.data &&
              typeof axiosError.response.data === 'object' &&
              'message' in axiosError.response.data
            ) {
              errorMessage = String(axiosError.response.data.message);
            }
          } else if (axiosError.response?.status === 401) {
            errorMessage = '로그인이 필요합니다.';
          } else if (axiosError.response?.status === 403) {
            errorMessage = '접근 권한이 없습니다.';
          }
        }

        open({
          type: 'confirm',
          title: '리뷰 등록 실패',
          description: errorMessage,
          primaryActionLabel: '확인',
        });
      },
    });
  };

  return (
    <Layout>
      <AppBar onBackClick={router.back} showBackButton={true} title="리뷰 작성" />
      <div css={wrapper}>
        <div css={header}>
          <Image src="/default.png" alt="기본 이미지" width={72} height={72} css={image} />
          <div css={content}>
            <Text typo="title_M">{mockData.recipientName}</Text>
            <div>
              <div css={item}>
                <Text typo="body_M" color="text_tertiary">
                  진료항목
                </Text>
                <Text typo="button_M" color="text_secondary">
                  {mockData.shopName}
                </Text>
              </div>
              <div css={item}>
                <Text typo="body_M" color="text_tertiary">
                  방문일자
                </Text>
                <Text typo="button_M" color="text_secondary">
                  {mockData.schedule}
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div css={container}>
          {isPending && <Loading title="리뷰를 등록하고 있어요" />}

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
            disabled={!rating || !reviewText || selectedTags.length === 0 || isPending}
          >
            {isPending ? '리뷰 등록 중...' : '리뷰 등록하기'}
          </RoundButton>
        </div>
      </div>
    </Layout>
  );
}
