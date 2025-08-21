import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import { RoundButton } from '@/components/button/round-button';
import { Text } from '@/components/text';
import { Check } from '@/icons';
import { css } from '@emotion/react';
import { theme } from '@/styles';

export default function ReservationCompletePage() {
  const handleGoToReservations = () => {
    alert('예약 목록으로 이동');
  };

  return (
    <Layout>
      <AppBar title="예약 완료" />

      <div css={container}>
        {/* 상단 섹션 - 예약 확정 정보 */}
        <div css={successSection}>
          <div css={checkIconWrapper}>
            <Check width={72} height={72} />
          </div>

          <Text tag="h1" typo="title_L" color="primary50" css={successMessage}>
            예약이 확정되었어요!
          </Text>

          <div css={reservationCard}>
            <Text tag="p" typo="button_M" color="text_primary" css={clinicName}>
              우주연 한의원
            </Text>
            <Text tag="p" typo="button_M" color="primary50" css={reservationDateTime}>
              2025.08.02 (토) 14:00
            </Text>
            <Text tag="p" typo="body_M" color="text_tertiary" css={packageName}>
              다이어트 패키지
            </Text>
          </div>
        </div>

        <section css={section}>
          {/* 중간 섹션 - 취소 및 예약금 규정 안내 */}
          <div css={policyCard}>
            <Text tag="h2" typo="title_S" color="text_primary" css={policyTitle}>
              취소 및 예약금 규정 안내
            </Text>

            <div css={policyContent}>
              <Text tag="p" typo="body_M" color="text_primary" css={policyText}>
                진료 예정일(진료 확정 날짜) 7일 전 (168시간) 예약 취소 시, 100% 환불됩니다.
              </Text>
              <Text tag="p" typo="body_M" color="text_primary" css={policyText}>
                진료 예정일(진료 확정 날짜) 7일이 남지 않은 경우, 예약 취소 시 보증금은 반환되지
                않습니다.
              </Text>
              <Text tag="p" typo="body_M" color="text_primary" css={policyText}>
                당일 진료를 위한 당일 예약은 취소가 불가하며, 노쇼(No show)시 예약금 규정 동일하게
                적용됩니다.
              </Text>
            </div>
          </div>

          {/* 하단 섹션 - 버튼 */}
          <div css={buttonSection}>
            <RoundButton onClick={handleGoToReservations} size="L" fullWidth>
              <Text typo="button_L" color="white">
                내 예약 목록으로 이동
              </Text>
            </RoundButton>
          </div>
        </section>
      </div>
    </Layout>
  );
}

const container = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 24px;
`;

const successSection = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  padding: 100px 0 32px;
`;

const checkIconWrapper = css`
  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 8px;
`;

const successMessage = css`
  margin-bottom: 32px;

  text-align: center;
`;

const reservationCard = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  width: 100%;
  max-width: 320px;
  padding: 20px;
  border: 1px solid ${theme.colors.primary50};
  border-radius: 12px;

  background-color: ${theme.colors.primary0};
`;

const clinicName = css`
  margin: 0;

  text-align: center;
`;

const reservationDateTime = css`
  margin: 0;

  text-align: center;
`;

const packageName = css`
  margin: 0;

  text-align: center;
`;

const section = css`
  display: flex;
  flex-direction: column;

  height: 100%;

  background-color: ${theme.colors.bg_default};
`;

const policyCard = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  margin: 16px 20px;
  padding: 20px;
  border-radius: 12px;

  background-color: ${theme.colors.white};
`;

const policyTitle = css`
  margin: 0;
`;

const policyContent = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const policyText = css`
  margin: 0;

  line-height: 1.5;
`;

const buttonSection = css`
  margin-top: auto;
  padding-bottom: 20px;
`;
