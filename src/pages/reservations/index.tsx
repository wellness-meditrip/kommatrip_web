import { useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog, useS3 } from '@/hooks';
import { useRouter } from 'next/router';
import Image from 'next/image';

import {
  wrapper,
  header,
  content,
  item,
  image,
  container,
  submitButton,
} from '@/styles/pages/reservations.styles';

import { MedicalInfoCard, VisitDateCard, ContactInfoCard, AdditionalInfoCard } from '@/components';
import { ROUTES } from '@/constants/commons';
import { usePostCreateReservationMutation } from '@/queries';

const mockData = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
};

export default function ReservationPage() {
  const { uploadToS3 } = useS3({ targetFolderPath: 'user/reservation-images' });

  // 진료 정보
  const [symptoms, setSymptoms] = useState<string>('');
  const [medications, setMedications] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // 방문 일자
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // 연락처 정보
  const [email, setEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [language, setLanguage] = useState<string>('한국어');

  // 기타 정보
  const [additionalInfo, setAdditionalInfo] = useState<string>('');

  const router = useRouter();
  const { showToast } = useToast();
  const { open } = useDialog();

  const { mutate, isPending } = usePostCreateReservationMutation();
  const handleSubmit = async () => {
    if (!symptoms || !selectedDate || !email || !contactPhone) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (symptoms.length < 10) {
      showToast({ title: '증상을 10자 이상 입력해주세요.', icon: 'exclaim' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({ title: '올바른 이메일 형식을 입력해주세요.', icon: 'exclaim' });
      return;
    }

    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(contactPhone.replace(/\s/g, ''))) {
      showToast({
        title: '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)',
        icon: 'exclaim',
      });
      return;
    }

    // S3 업로드
    let imageUrls: string[] = [];
    if (selectedImages.length > 0) {
      try {
        imageUrls = await uploadToS3(selectedImages);
      } catch {
        alert('이미지 업로드에 실패했습니다.');
        return;
      }
    }

    const reservationData = {
      hospital_id: 1, // mockData에서 가져올 수 있도록 수정 필요
      doctor_id: 1, // 실제 의사 ID로 수정 필요
      symptoms,
      current_medications: medications,
      reservation_date: selectedDate,
      reservation_time: selectedTime || '14:00:00.000Z',
      contact_email: email,
      contact_phone: contactPhone,
      interpreter_language: language,
      additional_notes: additionalInfo,
      user_id: 1, // 실제 사용자 ID로 수정 필요
      images: imageUrls, // S3 업로드된 이미지 URL들
    };

    mutate(reservationData, {
      onSuccess: (data) => {
        console.log('예약 성공:', data);
        showToast({ title: '예약이 성공적으로 접수되었습니다!' });
        router.push(ROUTES.RESERVATIONS_COMPLETE);
      },
      onError: (error: unknown) => {
        console.error('예약 실패:', error);
        console.log('예약 요청 데이터:', reservationData);
        let errorMessage = '예약 접수 중 오류가 발생했습니다. 다시 시도해주세요.';

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown } };
          console.log('서버 응답 데이터:', axiosError.response?.data);

          if (axiosError.response?.status === 422) {
            errorMessage = '입력하신 정보를 확인해주세요.';
          } else if (axiosError.response?.status === 401) {
            errorMessage = '로그인이 필요합니다.';
          } else if (axiosError.response?.status === 403) {
            errorMessage = '접근 권한이 없습니다.';
          }
        } else if (error && typeof error === 'object' && 'code' in error) {
          const axiosError = error as { code?: string; message?: string };

          if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
            errorMessage =
              '서버 응답이 지연되고 있습니다. 네트워크 상태를 확인하고 잠시 후 다시 시도해주세요.';
            console.log('타임아웃 에러 상세:', {
              code: axiosError.code,
              message: axiosError.message,
              timeout: '30초 초과',
            });
          }
        }

        open({
          type: 'confirm',
          title: '예약 접수 실패',
          description: errorMessage,
          primaryActionLabel: '확인',
        });
      },
    });
  };
  return (
    <Layout>
      <AppBar onBackClick={router.back} leftButton={true} title="예약하기" />
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
          <MedicalInfoCard
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            medications={medications}
            setMedications={setMedications}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />

          <VisitDateCard
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />

          <ContactInfoCard
            email={email}
            setEmail={setEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            language={language}
            setLanguage={setLanguage}
          />

          <AdditionalInfoCard
            additionalInfo={additionalInfo}
            setAdditionalInfo={setAdditionalInfo}
          />
        </div>

        <div css={submitButton}>
          <RoundButton
            service="daengle"
            size="L"
            fullWidth
            onClick={handleSubmit}
            disabled={!symptoms || !selectedDate || !email || !contactPhone || isPending}
          >
            예약하기
          </RoundButton>
        </div>
      </div>
    </Layout>
  );
}
