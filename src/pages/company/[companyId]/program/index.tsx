import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Text } from '@/components/text';
import { ArrowDown, Clock, Wallet } from '@/icons';
import {
  CTAButton,
  HeroImage,
  Loading,
  RoundButton,
  DesktopAppBar,
  PageErrorEmpty,
} from '@/components';
import { Meta, createPageMeta } from '@/seo';
import { ROUTES } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import { useGetProgramDetailQuery } from '@/queries/program';
import { useTranslations } from 'next-intl';
import { useAuthState, useMediaQuery } from '@/hooks';
import { useCurrentLocale } from '@/i18n/navigation';
import { resolvePrice } from '@/utils/price';
import { openLoginModal } from '@/utils/auth-modal';
import { getI18nServerSideProps } from '@/i18n/page-props';

export default function ProgramDetailPage() {
  const router = useRouter();
  const t = useTranslations('program-detail');
  const tCommon = useTranslations('common');
  const { programId } = router.query;
  const programIdNumber = Number(programId);
  const { data, isLoading, error } = useGetProgramDetailQuery(programIdNumber, {
    suppressGlobalError: true,
  });
  const pageTitle = data?.program?.name || t('title');
  const appDescription = tCommon('app.description');
  const metaDescription = data?.program?.description?.trim() || appDescription;
  const ogImage =
    data?.program?.image_urls?.[0] || data?.program?.primary_image_url || '/og/OG_image.jpg';
  const meta = createPageMeta({
    pageTitle,
    description: metaDescription,
    path: router.asPath,
    image: ogImage,
  });
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const [searchValue, setSearchValue] = useState('');
  const currentLocale = useCurrentLocale();
  const { isAuthenticated: isLoggedIn } = useAuthState();

  const handleReserveClick = () => {
    const rawCompanyId = Array.isArray(router.query.companyId)
      ? router.query.companyId[0]
      : router.query.companyId;
    const rawProgramId = Array.isArray(programId) ? programId[0] : programId;
    const searchParams = new URLSearchParams();

    if (rawCompanyId) {
      searchParams.set('companyId', String(rawCompanyId));
    }
    if (rawProgramId) {
      searchParams.set('programId', String(rawProgramId));
    }

    const reservationUrl = `/${currentLocale}${ROUTES.RESERVATIONS}${
      searchParams.size > 0 ? `?${searchParams.toString()}` : ''
    }`;

    if (!isLoggedIn) {
      openLoginModal({
        callbackUrl: reservationUrl,
        reason: 'reserve',
      });
      return;
    }

    void router.push(reservationUrl);
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
    if (!program) return '';
    const primaryImageUrl = program.primary_image_url || '';
    const fallbackImageUrl = program.image_urls?.[0] || '';
    return primaryImageUrl || fallbackImageUrl || '';
  }, [data]);

  const detailImageUrl = useMemo(() => {
    const program = data?.program;
    if (!program) return '';
    return program.primary_image_url || '';
  }, [data]);

  const [detailImageSrc, setDetailImageSrc] = useState('');

  useEffect(() => {
    setDetailImageSrc(detailImageUrl);
  }, [detailImageUrl]);

  if (!router.isReady || !programIdNumber) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={pageTitle}>
          <div css={desktopAppBar}>
            <DesktopAppBar
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              searchPlaceholder={tCommon('search.addressPlaceholder')}
            />
          </div>
          <div css={mobileAppBar}>
            <AppBar onBackClick={router.back} leftButton={true} />
          </div>
          <Loading title={t('loading')} />
        </Layout>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={pageTitle}>
          <div css={desktopAppBar}>
            <DesktopAppBar
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              searchPlaceholder={tCommon('search.addressPlaceholder')}
            />
          </div>
          <div css={mobileAppBar}>
            <AppBar onBackClick={router.back} leftButton={true} />
          </div>
          <Loading title={t('loading')} />
        </Layout>
      </>
    );
  }

  const program = data?.program;
  if (error) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={pageTitle}>
          <div css={desktopAppBar}>
            <DesktopAppBar
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              searchPlaceholder={tCommon('search.addressPlaceholder')}
            />
          </div>
          <div css={mobileAppBar}>
            <AppBar onBackClick={router.back} leftButton={true} />
          </div>
          <PageErrorEmpty error={error} fallbackMessage={t('loadFail')} />
        </Layout>
      </>
    );
  }

  if (!program) {
    return (
      <>
        <Meta {...meta} />
        <Layout isAppBarExist={false} title={pageTitle}>
          <div css={desktopAppBar}>
            <DesktopAppBar
              onSearchChange={handleSearchChange}
              onSearch={handleSearch}
              searchPlaceholder={tCommon('search.addressPlaceholder')}
            />
          </div>
          <div css={mobileAppBar}>
            <AppBar onBackClick={router.back} leftButton={true} />
          </div>
          <PageErrorEmpty
            fallbackMessage={t('loadFail')}
            statusOverride={404}
            messageOverride={tCommon('error.notFound')}
          />
        </Layout>
      </>
    );
  }

  const krwPrice = resolvePrice({
    currency: 'KRW',
    priceInfo: program.price_info,
  });
  const formattedPrice =
    typeof krwPrice === 'number' ? `${new Intl.NumberFormat('en-US').format(krwPrice)} KRW` : '-';
  const bookingInfo = program.booking_information?.replace(/\\n/g, '\n') ?? '';
  const refundInfo = program.refund_regulation?.replace(/\\n/g, '\n') ?? '';
  const processItems = program.process ?? [];

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={pageTitle}>
        <div css={desktopAppBar}>
          <DesktopAppBar
            onSearchChange={handleSearchChange}
            onSearch={handleSearch}
            searchPlaceholder={tCommon('search.addressPlaceholder')}
          />
        </div>
        <div css={mobileAppBar}>
          <AppBar onBackClick={router.back} leftButton={true} buttonType="dark" />
        </div>

        <div css={pageContainer}>
          <div css={contentLayout}>
            <div css={mainContent}>
              <div css={headerRow}>
                <div css={imageSection}>
                  <HeroImage
                    src={displayImageUrl}
                    alt={t('imageAlt')}
                    fallbackText={t('infoPending')}
                  />
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
                      <div key={index} css={processCard}>
                        <Text typo="body_M" color="primary30">
                          {t('step', { number: String(index + 1).padStart(2, '0') })}
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
                        alt={t('detailImageAlt')}
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
      </Layout>
    </>
  );
}

const imageSection = css`
  position: relative;
  width: 100%;
  height: clamp(200px, 45vw, 300px);
  background: ${theme.colors.bg_default};

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

const desktopAppBar = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
  }
`;

const mobileAppBar = css`
  display: block;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
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

export const getServerSideProps = getI18nServerSideProps(['program-detail']);
