import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Text } from '@/components/text';
import { Clock, Wallet } from '@/icons';
import { CTAButton, Tag } from '@/components';
import { ROUTES } from '@/constants';

export default function ProgramDetailPage() {
  const router = useRouter();
  const { companyId } = router.query;

  // 디버깅을 위한 로그
  console.log('router.isReady:', router.isReady);
  console.log('companyId:', companyId);

  const handleReserveClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 로그인된 상태 → 예약페이지로 이동
      router.push(ROUTES.RESERVATIONS);
    } else {
      // 로그인 안 된 상태 → RN에 로그인 요청
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOGIN_REQUEST' }));
    }
  };

  // router가 준비되지 않았거나 companyId가 없으면 로딩 표시
  if (!router.isReady || !companyId) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} showBackButton={true} title="Program" />
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AppBar onBackClick={router.back} showBackButton={true} title="Program" />

      {/* 메인 이미지 */}
      <div css={imageSection}>
        <img src="/default.png" alt="program" css={mainImage} />
      </div>

      {/* 프로그램 정보 */}
      <div css={programSection}>
        <Text typo="title_L" color="text_primary" css={programTitle}>
          Detox & Slimming
        </Text>

        <div css={badges}>
          <Tag service="meditrip" variant="line">
            Lifting
          </Tag>
          <Tag service="meditrip" variant="line">
            Diet
          </Tag>
          <Tag service="meditrip" variant="line">
            Postural correction
          </Tag>
        </div>

        {/* 프로그램 정보 카드 */}
        <div css={infoCard}>
          <Text typo="title_M" color="text_primary" css={infoTitle}>
            Program Information
          </Text>
          <div css={infoRow}>
            <Clock width={16} height={16} />
            <Text typo="button_S" color="text_secondary">
              90 mins
            </Text>
          </div>
          <div css={infoRow}>
            <Wallet width={16} height={16} />
            <Text typo="button_S" color="text_secondary">
              500,000 KRW
            </Text>
          </div>
        </div>

        {/* 프로세스 섹션 */}
        <div css={processSection}>
          <Text typo="title_M" color="text_primary" css={sectionTitle}>
            Process
          </Text>

          <div css={processSteps}>
            <div css={processStep}>
              <div css={stepIcon}>1</div>
              <div css={stepContent}>
                <Text typo="title_S" color="text_primary">
                  3D Facial Scan / Gait Analysis
                </Text>
                <Text typo="button_S" color="text_secondary">
                  Using digital equipment, we provide clear and objective indicators for foreign
                  patients.
                </Text>
              </div>
            </div>

            <div css={processStep}>
              <div css={stepIcon}>2</div>
              <div css={stepContent}>
                <Text typo="title_S" color="text_primary">
                  Ligament Correction Therapy
                </Text>
                <Text typo="button_S" color="text_secondary">
                  A licensed Korean medicine doctor directly massages the facial ligaments to
                  realign them.
                </Text>
              </div>
            </div>

            <div css={processStep}>
              <div css={stepIcon}>3</div>
              <div css={stepContent}>
                <Text typo="title_S" color="text_primary">
                  Ligament Correction Therapy
                </Text>
                <Text typo="button_S" color="text_secondary">
                  A licensed Korean medicine doctor directly massages the facial ligaments to
                  realign them.
                </Text>
              </div>
            </div>

            <div css={processStep}>
              <div css={stepIcon}>4</div>
              <div css={stepContent}>
                <Text typo="title_S" color="text_primary">
                  Ligament Correction Therapy
                </Text>
                <Text typo="button_S" color="text_secondary">
                  A licensed Korean medicine doctor directly massages the facial ligaments to
                  realign them.
                </Text>
              </div>
            </div>

            <div css={processStep}>
              <div css={stepIcon}>5</div>
              <div css={stepContent}>
                <Text typo="title_S" color="text_primary">
                  Ligament Correction Therapy
                </Text>
                <Text typo="button_S" color="text_secondary">
                  A licensed Korean medicine doctor directly massages the facial ligaments to
                  realign them.
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* 공지사항 섹션 */}
        <div css={noticeSection}>
          <Text typo="title_M" color="text_primary" css={sectionTitle}>
            Notice
          </Text>
          <div css={noticeCard}>
            <Text typo="button_S" color="text_secondary" css={noticeText}>
              All treatments are tailored to each individual after consultation with licensed
              medical professionals. Therefore, items included in the package may be subject to
              change.
            </Text>
            <Text typo="button_S" color="text_secondary" css={noticeText}>
              According to medical law, consultations can only be provided directly by medical
              professionals.
            </Text>
            <Text typo="button_S" color="text_secondary" css={noticeText}>
              For detailed information regarding medical procedures, possible side effects, and
              precautions, please contact each clinic or hospital through their official online
              channels (website or social media).
            </Text>
          </div>
        </div>
      </div>

      <CTAButton onClick={handleReserveClick}>Book Now</CTAButton>
    </Layout>
  );
}

const imageSection = css`
  width: 100%;
  height: 300px;
  overflow: hidden;
`;

const mainImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const programSection = css`
  padding: 24px;
  background: ${theme.colors.bg_surface1};
`;

const programTitle = css`
  margin-bottom: 12px;
`;

const badges = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const infoCard = css`
  background: ${theme.colors.bg_default};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const infoTitle = css`
  margin-bottom: 12px;
`;

const infoRow = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const processSection = css`
  margin-bottom: 24px;
`;

const sectionTitle = css`
  margin-bottom: 16px;
`;

const processSteps = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const processStep = css`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: ${theme.colors.bg_default};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const stepIcon = css`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${theme.colors.primary50};
  color: ${theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const stepContent = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const noticeSection = css`
  margin-bottom: 24px;
`;

const noticeCard = css`
  background: ${theme.colors.bg_default};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const noticeText = css`
  margin-bottom: 8px;
  line-height: 1.4;

  &:last-child {
    margin-bottom: 0;
  }
`;
