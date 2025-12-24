import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Text } from '@/components/text';
import { ArrowDown, Clock, Wallet } from '@/icons';
import { CTAButton, Loading } from '@/components';
import { ROUTES } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import { useGetProgramDetailQuery } from '@/queries/program';

export default function ProgramDetailPage() {
  const router = useRouter();
  const { programId } = router.query;
  const programIdNumber = Number(programId);
  const { data, isLoading } = useGetProgramDetailQuery(programIdNumber);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  const handleReserveClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push(ROUTES.RESERVATIONS);
    } else {
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOGIN_REQUEST' }));
    }
  };

  const detailsText = useMemo(() => {
    const program = data?.program;
    if (!program) return '';

    const formattedDescription = program.description?.replace(/\\n/g, '\n') ?? '';
    const formattedGuidelines = program.guidelines?.replace(/\\n/g, '\n') ?? '';
    if (formattedDescription && formattedGuidelines) {
      return `${formattedDescription}\n\n${formattedGuidelines}`;
    }
    return formattedDescription || formattedGuidelines;
  }, [data]);

  const displayImageUrl = useMemo(() => {
    const program = data?.program;
    if (!program) return '/default.png';
    const primaryImageUrl = program.primary_image_url || '';
    const fallbackImageUrl = program.image_urls?.[0] || '';
    return primaryImageUrl || fallbackImageUrl || '/default.png';
  }, [data]);

  const detailImageUrl = useMemo(() => {
    const program = data?.program;
    if (!program) return '';
    return program.primary_image_url || '';
  }, [data]);

  const [imageSrc, setImageSrc] = useState('/default.png');
  const [detailImageSrc, setDetailImageSrc] = useState('');

  useEffect(() => {
    setImageSrc(displayImageUrl);
  }, [displayImageUrl]);

  useEffect(() => {
    setDetailImageSrc(detailImageUrl);
  }, [detailImageUrl]);

  if (!router.isReady || !programIdNumber) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} title="Program" />
        <div>Loading...</div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} title="Program" />
        <Loading title="프로그램을 불러오는 중..." />
      </Layout>
    );
  }

  const program = data?.program;
  if (!program) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} title="Program" />
        <div>프로그램 정보를 불러올 수 없습니다.</div>
      </Layout>
    );
  }

  const formattedPrice = `${new Intl.NumberFormat('en-US').format(program.price)} KRW`;
  const bookingInfo = program.booking_information?.replace(/\\n/g, '\n') ?? '';
  const refundInfo = program.refund_regulation?.replace(/\\n/g, '\n') ?? '';
  const processItems = program.process ?? [];

  return (
    <Layout isAppBarExist={false}>
      <AppBar onBackClick={router.back} leftButton={true} buttonType="dark" title="Program" />

      <div css={imageSection}>
        <img
          src={imageSrc}
          alt="program"
          css={mainImage}
          onError={() => setImageSrc('/default.png')}
        />
      </div>

      <Text typo="title_L" color="text_primary" css={programTitle}>
        {program.name}
      </Text>
      <div css={programSection}>
        <div css={titleWrapper}>
          <Text typo="title_M" color="text_primary" css={infoTitle}>
            Program Information
          </Text>
        </div>
        <div css={infoCard}>
          <div css={infoRow}>
            <Clock width={16} height={16} />
            <Text typo="button_S" color="text_secondary">
              {program.duration_minutes} mins
            </Text>
          </div>
          <div css={infoRow}>
            <Wallet width={16} height={16} />
            <Text typo="button_S" color="text_secondary">
              {formattedPrice}
            </Text>
          </div>
        </div>

        <div css={processSection}>
          <div css={titleWrapper}>
            <Text typo="title_M" color="text_primary" css={sectionTitle}>
              Process
            </Text>
          </div>
          <div css={processGrid}>
            {processItems.map((step, index) => (
              <div key={`${step}-${index}`} css={processCard}>
                <Text typo="body_M" color="primary30">
                  {`Step ${String(index + 1).padStart(2, '0')}`}
                </Text>
                <Text typo="body_M" color="text_primary">
                  {step}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div css={detailsSection}>
          <div css={titleWrapper}>
            <Text typo="title_M" color="text_primary" css={sectionTitle}>
              Details
            </Text>
          </div>
          <div css={detailsCard}>
            {detailImageSrc && (
              <img
                src={detailImageSrc}
                alt="program detail"
                css={detailsImage}
                onError={() => setDetailImageSrc('')}
              />
            )}
            <Text typo="body_M" color="text_secondary" css={detailsTextStyle}>
              {detailsText || '정보 준비 중입니다.'}
            </Text>
          </div>
        </div>

        <div css={noticeSection}>
          <div css={titleWrapper}>
            <Text typo="title_M" color="text_primary" css={sectionTitle}>
              Notice
            </Text>
          </div>
          <div css={noticeCard}>
            <button css={noticeHeader} onClick={() => setIsBookingOpen((prev) => !prev)}>
              <Text typo="button_S" color="text_primary">
                Booking Information
              </Text>
              <ArrowDown width={16} height={16} css={noticeArrow(isBookingOpen)} />
            </button>
            {isBookingOpen && (
              <Text typo="body_S" color="text_secondary" css={noticeText}>
                {bookingInfo || '정보 준비 중입니다.'}
              </Text>
            )}
          </div>
          <div css={noticeCard}>
            <button css={noticeHeader} onClick={() => setIsRefundOpen((prev) => !prev)}>
              <Text typo="button_S" color="text_primary">
                Refund Policy
              </Text>
              <ArrowDown width={16} height={16} css={noticeArrow(isRefundOpen)} />
            </button>
            {isRefundOpen && (
              <Text typo="body_S" color="text_secondary" css={noticeText}>
                {refundInfo || '정보 준비 중입니다.'}
              </Text>
            )}
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
`;

const mainImage = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const programSection = css`
  gap: 12px;
  padding: 24px;
  padding-bottom: 120px;
  background: ${theme.colors.bg_surface1};
`;

const programTitle = css`
  padding: 16px 20px;
`;

const infoCard = css`
  background: ${theme.colors.bg_default};
  gap: 12px;
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

const processGrid = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const processCard = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${theme.colors.bg_default};
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
`;

const detailsSection = css`
  margin-bottom: 24px;
`;

const detailsCard = css`
  background: ${theme.colors.bg_default};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const detailsImage = css`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
`;

const detailsTextStyle = css`
  white-space: pre-wrap;
  line-height: 1.4;
`;

const noticeSection = css`
  margin-bottom: 24px;
`;

const noticeCard = css`
  background: ${theme.colors.bg_default};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 0 4px 0 ${theme.colors.shadow_default};
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const noticeHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const noticeArrow = (isOpen: boolean) => css`
  transform: ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const noticeText = css`
  margin-top: 8px;
  white-space: pre-wrap;
  line-height: 1.4;
`;

const titleWrapper = css`
  margin: 0 0 12px;
`;
