import { useState } from 'react';
import { AppBar, Layout, Text, RoundButton } from '@/components';
import { useToast, useDialog } from '@/hooks';
import { useRouter } from 'next/router';
import { DefaultImage } from '@/icons';

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
const mockData = {
  recipientName: '우주연 한의원',
  shopName: '다이어트 패키지',
  schedule: '2025-08-02T14:00:00',
};

export default function ReservationPage() {
  // 진료 정보
  const [symptoms, setSymptoms] = useState<string>('');
  const [medications, setMedications] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  // 방문 일자
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // 연락처 정보
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [language, setLanguage] = useState<string>('한국어');

  // 기타 정보
  const [additionalInfo, setAdditionalInfo] = useState<string>('');

  const router = useRouter();
  const { showToast } = useToast();
  const { open } = useDialog();

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!symptoms || !selectedDate || !email || !firstName || !lastName) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const reservationData = {
      clinic_id: 1,
      symptoms,
      medications,
      images: selectedImages,
      visit_date: selectedDate,
      visit_time: selectedTime,
      email,
      first_name: firstName,
      last_name: lastName,
      language,
      additional_info: additionalInfo,
    };

    try {
      // TODO: 실제 예약 API 호출
      console.log('예약 데이터:', reservationData);
      showToast({ title: '예약이 성공적으로 접수되었습니다!' });
      router.push(ROUTES.RESERVATIONS_COMPLETE); // 또는 예약 완료 페이지로 이동
    } catch {
      open({
        type: 'confirm',
        title: '예약 접수 실패',
        description: '예약 접수 중 오류가 발생했습니다. 다시 시도해주세요.',
        primaryActionLabel: '확인',
      });
    }
  };
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
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
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
            disabled={!symptoms || !selectedDate || !email || !firstName || !lastName}
          >
            예약하기
          </RoundButton>
        </div>
      </div>
    </Layout>
  );
}
