import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import CompanyDetail from '@/components/company/company-detail';
import { useRouter } from 'next/router';
import { CompanyInfo, CompanyReview, CompanyProgram } from '@/components/company-detail';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { CTAButton, Loading } from '@/components';
import { Tab } from '@/components/tabs';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { CompanyDetail as CompanyDetailType } from '@/models';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { ROUTES } from '@/constants';

export default function ClinicDetailPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const companyIdNumber = Number(companyId);

  const params = {
    companyId: companyIdNumber,
  };

  const { data, error } = useGetCompanyDetailQuery(params) as {
    data: { company: CompanyDetailType } | undefined;
    error: Error | null;
  };
  const [activeTab, setActiveTab] = useState<string>('info');

  // 각 섹션에 대한 ref 생성
  const infoRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const isScrollingToSection = useRef(false);

  const TABS = useMemo(
    () => [
      { id: 'info', label: 'Information', ref: infoRef },
      { id: 'program', label: 'Programs', ref: programRef },
      { id: 'review', label: 'Reviews', ref: reviewRef },
    ],
    []
  );

  useEffect(() => {
    const queryTab = router.query.service as string;
    if (queryTab && TABS.some((tab) => tab.id === queryTab)) {
      setActiveTab(queryTab);
      // URL에서 탭 정보를 가져오면 해당 섹션으로 스크롤
      setTimeout(() => {
        const tab = TABS.find((t) => t.id === queryTab);
        if (tab?.ref.current) {
          tab.ref.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [router.query.service, TABS]);

  // 비회원 검증 로직
  // const { data: isValidUser, isSuccess } = useGetUserValidateQuery();

  // useEffect(() => {
  //   if (!isValidUser?.isValidateMember && isSuccess) {
  //     router.replace(ROUTES.LOGIN);
  //   }
  // }, [isSuccess, isValidUser]);

  // 스크롤 이벤트를 사용하여 현재 보이는 섹션 감지
  useEffect(() => {
    if (!data?.company) return;

    // main 엘리먼트 찾기 (실제 스크롤이 발생하는 곳)
    const mainElement = document.querySelector('main');
    if (!mainElement) {
      console.error('❌ main 엘리먼트를 찾을 수 없습니다');
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (isScrollingToSection.current) {
            ticking = false;
            return;
          }

          // main 엘리먼트의 스크롤 위치 사용
          const scrollPosition = mainElement.scrollTop + 150;

          // 모든 섹션의 위치 가져오기
          const programTop = programRef.current?.offsetTop || 0;
          const reviewTop = reviewRef.current?.offsetTop || 0;

          let currentTab = 'info';

          if (scrollPosition >= reviewTop) {
            currentTab = 'review';
          } else if (scrollPosition >= programTop) {
            currentTab = 'program';
          } else {
            currentTab = 'info';
          }

          setActiveTab((prev) => {
            if (prev !== currentTab) {
              router.replace({ query: { ...router.query, service: currentTab } }, undefined, {
                shallow: true,
              });
              return currentTab;
            }
            return prev;
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 실행

    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [data, router, activeTab]);

  const handleTabClick = useCallback(
    (tabId: string) => {
      const tab = TABS.find((t) => t.id === tabId);

      if (tab?.ref.current) {
        isScrollingToSection.current = true;
        setActiveTab(tabId);
        router.replace({ query: { ...router.query, service: tabId } }, undefined, {
          shallow: true,
        });

        // scrollIntoView를 사용하여 더 부드러운 스크롤
        tab.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        // 스크롤이 끝난 후 플래그 해제
        setTimeout(() => {
          isScrollingToSection.current = false;
        }, 600);
      }
    },
    [TABS, router]
  );

  const handleReserveClick = () => {
    router.push(ROUTES.RESERVATIONS);
  };
  // router가 준비되지 않았거나 companyId가 없으면 로딩 표시
  if (!router.isReady || !companyId || isNaN(companyIdNumber)) {
    return (
      <Layout>
        <Loading title="데이터를 불러오는 중..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div>Error loading data</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <Loading title="데이터를 불러오는 중..." />
      </Layout>
    );
  }

  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        rightButton={true}
        buttonType="dark"
        rightButtonType="share"
        backgroundColor="bg_surface1"
      />
      {data?.company && (
        <CompanyDetail
          badges={data.company.tags || []}
          companyImage={data.company.primary_image_url || '/default.png'}
          companyName={data.company.name}
          companyAddress={data.company.address}
          images={data.company.image_urls || []}
        />
      )}

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
            {data?.company ? (
              <CompanyInfo data={data.company} />
            ) : (
              <div>데이터를 불러오는 중...</div>
            )}
          </div>

          <div ref={programRef} data-section="program" css={section}>
            {data?.company ? (
              <CompanyProgram badges={data.company.tags || []} />
            ) : (
              <div>데이터를 불러오는 중...</div>
            )}
          </div>

          <div ref={reviewRef} data-section="review" css={section}>
            <CompanyReview />
          </div>
        </div>
      </section>
      <CTAButton onClick={handleReserveClick}>Book Now</CTAButton>
    </Layout>
  );
}

const wrapper = css`
  display: flex;
  flex-direction: column;

  background: ${theme.colors.white};

  h1 {
    margin: 0 18px;
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
`;

const content = css`
  width: 100%;
  background: ${theme.colors.bg_surface1};
`;

const section = css`
  width: 100%;
  scroll-margin-top: 50px; /* 스크롤 시 탭 헤더 공간 확보 */
`;
