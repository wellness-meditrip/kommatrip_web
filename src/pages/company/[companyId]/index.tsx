import { useRouter } from 'next/router';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import type { GetServerSideProps } from 'next';
import { dehydrate } from '@tanstack/react-query';

import {
  AppBar,
  Layout,
  Tab,
  CompanyInfo,
  CompanyReview,
  CompanyProgram,
  CompanyNotice,
  CTAButton,
  DesktopAppBar,
  RoundButton,
  Loading,
} from '@/components';
import { Meta, buildCompanyDetailJsonLd, createPageMeta } from '@/seo';
import CompanyDetail from '@/components/company/company-detail';
import {
  fetchCompanyDetailQuery,
  getCompanyDetailQueryKey,
  useGetCompanyDetailQuery,
} from '@/queries/company';
import { CompanyDetail as CompanyDetailType } from '@/models';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';
import { useAuthState, useMediaQuery, useToast } from '@/hooks';
import { useCurrentLocale } from '@/i18n/navigation';
import { withI18nGssp } from '@/i18n/page-props';
import { openLoginModal } from '@/utils/auth-modal';
import { normalizeError } from '@/utils/error-handler';
import { createQueryClient } from '@/providers';

interface ClinicDetailPageProps extends Record<string, unknown> {
  companyId: number;
  initialCompany: CompanyDetailType;
  initialCanonicalPath: string;
}

const watchingRandMin = 2;
const watchingRandMax = 20;

const getWatchingRandomCount = () =>
  Math.floor(Math.random() * (watchingRandMax - watchingRandMin + 1)) + watchingRandMin;

export default function ClinicDetailPage({
  companyId,
  initialCompany,
  initialCanonicalPath,
}: ClinicDetailPageProps) {
  const router = useRouter();
  const t = useTranslations('company-detail');
  const tCompany = useTranslations('company');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const { showToast } = useToast();
  const [searchValue, setSearchValue] = useState('');

  const companyIdNumber = companyId;

  const params = {
    companyId: companyIdNumber,
  };

  const { data, error } = useGetCompanyDetailQuery(params, {
    suppressGlobalError: true,
    initialData: { company: initialCompany },
  }) as {
    data: { company: CompanyDetailType } | undefined;
    error: Error | null;
  };
  const company = data?.company ?? initialCompany;
  const [activeTab, setActiveTab] = useState<string>('info');

  // 각 섹션에 대한 ref 생성
  const infoRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const lastShownWatchingToastCompanyId = useRef<number | null>(null);
  const isScrollingToSection = useRef(false);
  const isObserverSyncing = useRef(false);
  const hasHandledQueryTab = useRef(false);

  const TABS = useMemo(
    () => [
      { id: 'info', label: t('tabs.info'), ref: infoRef },
      { id: 'program', label: t('tabs.program'), ref: programRef },
      { id: 'review', label: t('tabs.review'), ref: reviewRef },
      { id: 'notice', label: t('tabs.notice'), ref: noticeRef },
    ],
    [t]
  );

  useEffect(() => {
    if (!company) return;
    if (lastShownWatchingToastCompanyId.current === companyIdNumber) return;

    lastShownWatchingToastCompanyId.current = companyIdNumber;
    showToast({
      title: t('toast.watchingNow', { count: getWatchingRandomCount() }),
      time: 3000,
      variant: 'watching',
    });
  }, [company, companyIdNumber, showToast, t]);

  useEffect(() => {
    if (!router.isReady) return;
    const queryTab = router.query.service as string;
    if (!queryTab || !TABS.some((tab) => tab.id === queryTab)) return;

    setActiveTab(queryTab);

    const shouldSkipScroll = isObserverSyncing.current || isScrollingToSection.current;
    if (isObserverSyncing.current) {
      isObserverSyncing.current = false;
    }
    if (hasHandledQueryTab.current || shouldSkipScroll) return;
    hasHandledQueryTab.current = true;

    // URL에서 탭 정보를 가져오면 해당 섹션으로 스크롤
    setTimeout(() => {
      const tab = TABS.find((t) => t.id === queryTab);
      if (tab?.ref.current) {
        tab.ref.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [router.isReady, router.query.service, TABS]);

  // 비회원 검증 로직
  // const { data: isValidUser, isSuccess } = useGetUserValidateQuery();

  // useEffect(() => {
  //   if (!isValidUser?.isValidateMember && isSuccess) {
  //     router.replace(ROUTES.LOGIN);
  //   }
  // }, [isSuccess, isValidUser]);

  // IntersectionObserver로 현재 섹션 감지
  useEffect(() => {
    if (!company) return;

    const mainElement = document.querySelector('main');
    if (!mainElement) {
      console.error('❌ main 엘리먼트를 찾을 수 없습니다');
      return;
    }

    const sections = [
      { id: 'info', ref: infoRef },
      { id: 'program', ref: programRef },
      { id: 'review', ref: reviewRef },
      { id: 'notice', ref: noticeRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingToSection.current) return;

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const currentId = visible?.target.getAttribute('data-section');
        if (!currentId) return;

        setActiveTab((prev) => {
          if (prev !== currentId) {
            const localizedPath = `/${currentLocale}${ROUTES.COMPANY_DETAIL(companyIdNumber)}`;
            isObserverSyncing.current = true;
            router.replace(
              {
                pathname: '/company/[companyId]',
                query: { companyId: companyIdNumber, service: currentId },
              },
              `${localizedPath}?service=${currentId}`,
              {
                shallow: true,
              }
            );
            return currentId;
          }
          return prev;
        });
      },
      {
        root: mainElement,
        threshold: [0.25, 0.5, 0.75],
      }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [company, router, companyIdNumber, currentLocale]);

  const handleTabClick = useCallback(
    (tabId: string) => {
      const tab = TABS.find((t) => t.id === tabId);

      if (tab?.ref.current) {
        isScrollingToSection.current = true;
        setActiveTab(tabId);
        const localizedPath = `/${currentLocale}${ROUTES.COMPANY_DETAIL(companyIdNumber)}`;
        router.replace(
          {
            pathname: '/company/[companyId]',
            query: { companyId: companyIdNumber, service: tabId },
          },
          `${localizedPath}?service=${tabId}`,
          {
            shallow: true,
          }
        );

        // scrollIntoView를 사용하여 더 부드러운 스크롤
        tab.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // 스크롤이 끝난 후 플래그 해제
        setTimeout(() => {
          isScrollingToSection.current = false;
        }, 900);
      }
    },
    [TABS, router, companyIdNumber, currentLocale]
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: company?.name || t('title'),
          url: shareUrl,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  const handleSearch = () => {
    const query = searchValue.trim() ? `?q=${encodeURIComponent(searchValue)}` : '';
    router.push(`/${currentLocale}${ROUTES.SEARCH}${query}`);
  };

  const { isAuthenticated: isLoggedIn } = useAuthState();

  const handleReserveClick = () => {
    if (typeof window !== 'undefined' && company) {
      window.sessionStorage.setItem('reservation_company', JSON.stringify(company));
    }

    const reservationUrl = `/${currentLocale}${ROUTES.RESERVATIONS}?companyId=${companyIdNumber}`;

    if (!isLoggedIn) {
      openLoginModal({
        callbackUrl: reservationUrl,
        reason: 'reserve',
      });
      return;
    }

    void router.push(reservationUrl);
  };
  // router가 준비되지 않았거나 companyId가 없으면 로딩 표시
  const companyName = company?.name?.trim();
  const pageTitle = companyName || t('title');
  const companyDescription = company?.description?.trim() || '';
  const metaDescription = companyDescription || tCommon('app.description');
  const ogImage = company?.image_urls?.[0] || company?.primary_image_url || '/og/OG_image.jpg';
  const jsonLd = company
    ? buildCompanyDetailJsonLd({
        company,
        companyId: companyIdNumber,
        locale: currentLocale,
        homeLabel: tCommon('app.name'),
        companyListLabel: tCompany('title'),
        pageTitle,
      })
    : undefined;
  const meta = createPageMeta({
    pageTitle,
    description: metaDescription,
    path: router.asPath || initialCanonicalPath,
    image: ogImage,
    jsonLd,
  });

  if (!company) {
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
            <AppBar
              onBackClick={router.back}
              leftButton={true}
              rightButton={true}
              buttonType="dark"
              rightButtonType="share"
              onRightButtonClick={handleShare}
              backgroundColor="bg_surface1"
            />
          </div>
          <Loading title={t('loading')} />
        </Layout>
      </>
    );
  }

  if (error) {
    console.error('[ClinicDetailPage] company detail query error', error);
  }

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
          <AppBar
            onBackClick={router.back}
            leftButton={true}
            rightButton={true}
            buttonType="dark"
            rightButtonType="share"
            onRightButtonClick={handleShare}
            backgroundColor="bg_surface1"
          />
        </div>
        <div css={pageContainer}>
          <div css={contentLayout}>
            <div css={mainContent}>
              <CompanyDetail
                badges={company.tags || []}
                companyImage={company.primary_image_url || '/default.png'}
                companyName={company.name}
                companyCode={company.company_code}
                companyAddress={company.address}
                images={company.image_urls || []}
              />

              <section css={wrapper}>
                {/* 고정된 탭 헤더 */}
                <div css={stickyTabHeader}>
                  {TABS.map((tab) => (
                    <Tab
                      key={tab.id}
                      id={tab.id}
                      label={tab.label}
                      isActive={activeTab === tab.id}
                      onClick={() => handleTabClick(tab.id)}
                    />
                  ))}
                </div>

                {/* 모든 컨텐츠를 한 번에 렌더링 */}
                <div css={content}>
                  <div ref={infoRef} data-section="info" css={section}>
                    <CompanyInfo data={company} />
                  </div>

                  <div ref={programRef} data-section="program" css={section}>
                    <CompanyProgram
                      badges={company.tags || []}
                      companyId={companyIdNumber}
                      companyName={company.name}
                      companyCode={company.company_code}
                    />
                  </div>

                  <div ref={reviewRef} data-section="review" css={section}>
                    <CompanyReview companyId={companyIdNumber} />
                  </div>

                  <div ref={noticeRef} data-section="notice" css={section}>
                    <CompanyNotice
                      bookingInformation={company.booking_information}
                      refundRegulation={company.refund_regulation}
                    />
                  </div>

                  {/* <div css={youWillAlsoLikeWrapper}>
                  <CompanyList title="You will also like" companies={[]} />
                </div> */}
                </div>
              </section>
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

const wrapper = css`
  display: flex;
  flex-direction: column;

  background: ${theme.colors.white};
  padding-bottom: 120px;

  h1 {
    margin: 0 18px;
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-top: 0;
  }
`;

const stickyTabHeader = css`
  display: flex;
  position: sticky;
  top: 0px;
  z-index: 10;
  background: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.border_default};
  padding: 0;
  transition: box-shadow 0.2s ease-in-out;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 1px;
    background: ${theme.colors.border_default};
  }

  @media (min-width: ${theme.breakpoints.desktop}) {
    top: 76px;
    z-index: ${theme.zIndex.appBar};
  }
`;

const content = css`
  width: 100%;
`;

const section = css`
  width: 100%;
  scroll-margin-top: 50px; /* 스크롤 시 탭 헤더 공간 확보 */
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
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.appBar};
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
  /* background: ${theme.colors.bg_default}; */
  border-radius: 16px;
  /* padding: 20px; */
  /* box-shadow: 0 8px 20px 0 rgb(15 23 42 / 8%); */
`;

export const youWillAlsoLikeWrapper = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  padding: 24px 24px 80px;
  align-self: stretch;
`;

export const getServerSideProps: GetServerSideProps<ClinicDetailPageProps> =
  withI18nGssp<ClinicDetailPageProps>(
    async ({ params }) => {
      const companyIdParam = params?.companyId;
      const rawCompanyId = Array.isArray(companyIdParam) ? companyIdParam[0] : companyIdParam;
      const companyId = Number(rawCompanyId);

      if (!companyId || Number.isNaN(companyId)) {
        return { notFound: true };
      }

      try {
        const queryClient = createQueryClient();
        const response = await queryClient.fetchQuery({
          queryKey: getCompanyDetailQueryKey(companyId),
          queryFn: () => fetchCompanyDetailQuery({ companyId }),
        });
        if (!response?.company) {
          return { notFound: true };
        }

        const canonicalPath = `/company/${companyId}`;

        return {
          props: {
            companyId,
            initialCompany: response.company,
            initialCanonicalPath: canonicalPath,
            dehydratedState: dehydrate(queryClient),
          },
        };
      } catch (error) {
        const normalizedError = normalizeError(error);

        if (normalizedError.status === 404) {
          return { notFound: true };
        }

        // 5xx/network 등 일시 오류는 404로 고정하지 않고 예외를 던져
        // ISR에서 기존 정상 페이지를 유지하도록 한다.
        throw error;
      }
    },
    ['company', 'company-detail', 'program', 'review', 'common']
  );
