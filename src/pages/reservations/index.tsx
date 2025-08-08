import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog, useS3 } from '@/hooks';
import { useRouter } from 'next/router';
import { DefaultImage } from '@/icons';
import { convertKeywordNamesToRequestPayload, convertBlobToBase64 } from '@/utils';

import {
  wrapper,
  header,
  content,
  item,
  image,
  container,
  submitButton,
  textarea,
  itemWrapper,
} from './index.styles';
import 'dayjs/locale/ko';
dayjs.locale('ko'); // 전역에서 단 1회만
import { KeywordCard, RatingCard, ReviewInputCard } from '@/components/reviews';

import { CLINIC_REVIEW_KEYWORDS } from '@/constants/review';
import { ROUTES } from '@/constants/commons';
import { usePostClinicReviewMutation } from '@/queries';
import { Loading } from '@/components/common';
import { Section } from '@/components/section';
import dayjs from 'dayjs';
import { DatePicker } from '@/components/date-picker';
import { useValidateGeneralClinicForm } from '@/hooks/reservation/use-validate-general-clinic-form';
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
  const { mutate, isPending, isError } = usePostClinicReviewMutation();
  const keywordNames = CLINIC_REVIEW_KEYWORDS.map((k) => k.keyword_name);
  const { control } = useForm();
  const validate = useValidateGeneralClinicForm();

  // const { uploadToS3 } = useS3({ targetFolderPath: 'user/review-images' });
  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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

    // selectedImages를 base64 문자열로 변환

    const base64Images = await Promise.all(
      selectedImages.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    );

    const uploadedImageUrls = selectedImages.map((file, index) => URL.createObjectURL(file));

    const mappedKeywords = convertKeywordNamesToRequestPayload(selectedTags);

    const body = {
      hospital_id: mockReservationData.hospital_id,
      user_id: mockReservationData.user_id,
      doctor_id: mockReservationData.doctor_id,
      doctor_name: mockReservationData.doctor_name,
      title: `${mockReservationData.shopName} 후기`,
      content: reviewText,
      rating,
      keywords: mappedKeywords,
      images: base64Images,
    };

    mutate(body, {
      onSuccess: () => {
        showToast({ title: '리뷰가 성공적으로 등록되었습니다!' });
        router.push(ROUTES.MYPAGE_REVIEWS);
      },
      onError: (error: any) => {
        open({
          type: 'confirm',
          title: '리뷰 등록 실패',
          description: error?.message || '알 수 없는 오류가 발생했습니다.',
          primaryActionLabel: '확인',
        });
      },
    });
  };

  const mockReservationData = {
    hospital_id: 1,
    user_id: 1,
    doctor_id: 1,
    doctor_name: '홍길동',
    partnerName: '우주연 한의원',
    shopName: '다이어트 패키지',
    schedule: '2025-08-02T14:00:00',
  };
  const reservedDate = '2025-08-10 11:22:11';
  return (
    <Layout>
      <AppBar onBackClick={router.back} showBackButton={true} title="예약하기" />
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
            <Loading title="예약 내역을 불러오고 있어요" />
          ) : isError ? (
            <Text typo="body11">예약 데이터를 불러오는 데 실패했습니다.</Text>
          ) : (
            <>
              {/* <KeywordCard
                tags={keywordNames}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
                isExpanded={isExpanded}
                toggleExpand={toggleExpand}
              /> */}

              <ReviewInputCard
                reviewText={reviewText}
                setReviewText={setReviewText}
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
              />
              <div css={itemWrapper}>
                <Text typo="title_M">원하는 방문 일자</Text>
                <Text typo="title_S">방문 날짜</Text>
                {/* <Section title="시술 희망 날짜 및 시간"> */}
                {/* <Text typo="title2">{dayjs(reservedDate).format('YYYY.MM.DD(ddd) • HH:mm')}</Text> */}
                {/* <Controller
                    name="reservedDate"
                    control={control}
                    rules={validate.reservedDate}
                    render={({ field }) => <DatePicker {...field} onChange={field.onChange} />}
                  /> */}
                {/* </Section> */}
              </div>
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
