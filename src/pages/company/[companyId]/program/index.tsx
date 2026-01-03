import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Text } from '@/components/text';
import { ArrowDown, Clock, Wallet } from '@/icons';
import { CTAButton, Loading, Empty, RoundButton, DesktopAppBar, LoginModal } from '@/components';
import { ROUTES } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import { useGetProgramDetailQuery } from '@/queries/program';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/auth';
import { useCurrentLocale } from '@/i18n/navigation';

export default function ProgramDetailPage() {
  const router = useRouter();
  const t = useTranslations('program-detail');
  const tCommon = useTranslations('common');
  const { programId } = router.query;
  const programIdNumber = Number(programId);
  const { data, isLoading } = useGetProgramDetailQuery(programIdNumber);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [searchValue, setSearchValue] = useState('');
  const currentLocale = useCurrentLocale();
  const { status } = useSession();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isLoggedIn = status === 'authenticated' || !!accessToken;
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleReserveClick = () => {
    if (isLoggedIn) {
      router.push(`/${currentLocale}${ROUTES.RESERVATIONS}`);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    router.push(`/${currentLocale}${ROUTES.SEARCH}${query}`);
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
  const isSasImage = imageSrc?.includes('meditripstorage.blob.core.windows.net')
    ? imageSrc.includes('sig=')
    : false;
  const isOptimizableImage = (url: string) => {
    if (!url) return false;
    if (url.startsWith('/')) return true;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'https:') return false;
      return [
        'drive.google.com',
        'meditrip.s3.ap-northeast-2.amazonaws.com',
        'meditripstorage.blob.core.windows.net',
      ].includes(parsedUrl.hostname);
    } catch {
      return false;
    }
  };
  const shouldUseNextImage = isOptimizableImage(imageSrc);

  useEffect(() => {
    setImageSrc(displayImageUrl);
  }, [displayImageUrl]);

  useEffect(() => {
    setDetailImageSrc(detailImageUrl);
  }, [detailImageUrl]);

  if (!router.isReady || !programIdNumber) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} title={t('title')} />
        <Loading title={t('loading')} />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} title={t('title')} />
        <Loading title={t('loading')} />
      </Layout>
    );
  }

  const program = data?.program;
  if (!program) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} title={t('title')} />
        <Empty title={t('loadFail')} />
      </Layout>
    );
  }

  const formattedPrice = `${new Intl.NumberFormat('en-US').format(program.price)} KRW`;
  const bookingInfo = program.booking_information?.replace(/\\n/g, '\n') ?? '';
  const refundInfo = program.refund_regulation?.replace(/\\n/g, '\n') ?? '';
  const processItems = program.process ?? [];

  return (
    <Layout isAppBarExist={false}>
      {isDesktop ? (
        <DesktopAppBar
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          searchPlaceholder={tCommon('search.addressPlaceholder')}
        />
      ) : (
        <AppBar onBackClick={router.back} leftButton={true} buttonType="dark" title={t('title')} />
      )}

      <div css={pageContainer}>
        <div css={contentLayout}>
          <div css={mainContent}>
            <div css={headerRow}>
              <div css={imageSection}>
                {shouldUseNextImage ? (
                  <Image
                    src={imageSrc}
                    alt="program"
                    width={1200}
                    height={800}
                    sizes="100vw"
                    quality={90}
                    priority
                    unoptimized={isSasImage}
                    css={mainImage}
                    onError={() => setImageSrc('/default.png')}
                  />
                ) : (
                  <img
                    src={imageSrc}
                    alt="program"
                    css={mainImage}
                    onError={() => setImageSrc('/default.png')}
                  />
                )}
              </div>

              <Text typo="title_L" color="text_primary" css={programTitle}>
                {program.name}
              </Text>
            </div>
            <div css={programSection}>
              <div css={titleWrapper}>
                <Text typo="title_M" color="text_primary" css={infoTitle}>
                  {t('programInfo')}
                </Text>
              </div>
              <div css={infoCard}>
                <div css={infoRow}>
                  <Clock width={16} height={16} />
                  <Text typo="button_S" color="text_secondary">
                    {t('duration', { minutes: program.duration_minutes })}
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
                    {t('process')}
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
                    {t('details')}
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
                    {detailsText || t('infoPending')}
                  </Text>
                </div>
              </div>

              <div css={noticeSection}>
                <div css={titleWrapper}>
                  <Text typo="title_M" color="text_primary" css={sectionTitle}>
                    {t('notice')}
                  </Text>
                </div>
                <div css={noticeCard}>
                  <button css={noticeHeader} onClick={() => setIsBookingOpen((prev) => !prev)}>
                    <Text typo="title_S" color="text_primary">
                      {t('bookingInfo')}
                    </Text>
                    <ArrowDown width={16} height={16} css={noticeArrow(isBookingOpen)} />
                  </button>
                  {isBookingOpen && (
                    <Text typo="body_M" color="text_secondary" css={noticeText}>
                      {bookingInfo || t('infoPending')}
                    </Text>
                  )}
                </div>
                <div css={noticeCard}>
                  <button css={noticeHeader} onClick={() => setIsRefundOpen((prev) => !prev)}>
                    <Text typo="title_S" color="text_primary">
                      {t('refundPolicy')}
                    </Text>
                    <ArrowDown width={16} height={16} css={noticeArrow(isRefundOpen)} />
                  </button>
                  {isRefundOpen && (
                    <Text typo="body_M" color="text_secondary" css={noticeText}>
                      {refundInfo || t('infoPending')}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isDesktop && (
            <aside css={stickySidebar}>
              <div css={bookingCard}>
                <RoundButton size="L" fullWidth onClick={handleReserveClick}>
                  {t('bookNow')}
                </RoundButton>
              </div>
            </aside>
          )}
        </div>
      </div>

      {!isDesktop && <CTAButton onClick={handleReserveClick}>{t('bookNow')}</CTAButton>}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
}

const imageSection = css`
  width: 100%;
  height: clamp(200px, 45vw, 300px);

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 420px;
    height: 260px;
    flex: 0 0 420px;
    border-radius: 12px;
    overflow: hidden;
  }
`;

const pageContainer = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    margin: 0 auto;
    padding: 0 32px;
  }
`;

const contentLayout = css`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;
    gap: 32px;
    align-items: start;
  }
`;

const mainContent = css`
  display: flex;
  flex-direction: column;
`;

const stickySidebar = css`
  position: sticky;
  top: 96px;
  align-self: start;
`;

const bookingCard = css`
  background: ${theme.colors.bg_default};
  border-radius: 16px;

  box-shadow: 0 8px 20px 0 rgb(15 23 42 / 8%);
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
`;

const programTitle = css`
  padding: 16px 20px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 0;
  }
`;

const headerRow = css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    flex-direction: row;
    align-items: center;
    gap: 24px;
    padding: 24px;
  }
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
  gap: 16px;
  align-items: flex-start;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const detailsImage = css`
  width: 180px;
  height: 140px;
  border-radius: 12px;
  object-fit: cover;
  display: block;

  @media (max-width: 640px) {
    width: 100%;
    height: clamp(200px, 55vw, 320px);
  }
`;

const detailsTextStyle = css`
  white-space: pre-wrap;
  line-height: 1.4;
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
