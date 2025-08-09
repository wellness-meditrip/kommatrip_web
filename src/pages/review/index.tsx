import { useEffect, useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog } from '@/hooks';
import { useRouter } from 'next/router';
import { DefaultImage } from '@/icons';
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
import { ROUTES } from '@/constants/commons';
import { usePostClinicReviewMutation } from '@/queries';
import { Loading } from '@/components/common';

const mockData = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
};
interface UserInfo {
  country: string;
  displayName: string;
  email: string;
  id: number;
  isNewUser: boolean;
  language: string;
  nickname: string;
}
export default function ReviewPage() {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const router = useRouter();
  const { showToast } = useToast();
  const { open } = useDialog();
  const { mutate, isPending, isError } = usePostClinicReviewMutation();
  const keywordNames = CLINIC_REVIEW_KEYWORDS.map((k) => k.keyword_name);
  // const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // const { uploadToS3 } = useS3({ targetFolderPath: 'user/review-images' });

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
    // let uploadedImageUrls: string[] = [];

    // if (selectedImages.length > 0) {
    //   uploadedImageUrls = (await uploadToS3(selectedImages)) || [];

    //   if (!uploadedImageUrls) {
    //     alert('이미지 업로드에 실패했습니다.');
    //     return;
    //   }
    // }

    // 이미지 메타데이터 추출
    let imageMetadata: string[] = [];
    if (selectedImages.length > 0) {
      try {
        const metadata = await extractMultipleImageMetadata(selectedImages, 1);
        imageMetadata = metadata.map((item) => item.image_data);
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
        router.push(ROUTES.MYPAGE_REVIEWS);
      },
      onError: (error: Error) => {
        open({
          type: 'confirm',
          title: '리뷰 등록 실패',
          description: error?.message || '알 수 없는 오류가 발생했습니다.',
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
          <DefaultImage width={72} height={72} css={image} />
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
          {isPending ? (
            <Loading title="리뷰 내역을 불러오고 있어요" />
          ) : isError ? (
            <Text typo="body11">리뷰 데이터를 불러오는 데 실패했습니다.</Text>
          ) : (
            <>
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
            </>
          )}
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
