import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import ClinicDetail from '@/components/clinic/clinic-detail';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { ClinicInfo, ClinicReview } from '@/components/clinic-detail';
import { useEffect, useState, useMemo } from 'react';
import { Tabs } from '@/components';
import { theme } from '@/styles';
// import { useGetUserValidateQuery } from '@/queries';
// import { ROUTES } from '@/constants/commons';

export default function ClinicDetailPage() {
  const router = useRouter();

  // 비회원 검증 로직
  // const { data: isValidUser, isSuccess } = useGetUserValidateQuery();

  // useEffect(() => {
  //   if (!isValidUser?.isValidateMember && isSuccess) {
  //     router.replace(ROUTES.LOGIN);
  //   }
  // }, [isSuccess, isValidUser]);

  const [activeTab, setActiveTab] = useState<string>('info');

  const renderContent = (activeTabId: string) => {
    switch (activeTabId) {
      case 'info':
        return <ClinicInfo />;
      case 'review':
        return <ClinicReview />;
      default:
        return <ClinicInfo />;
    }
  };

  const TABS = useMemo(
    () => [
      { id: 'info', label: '병원정보' },
      { id: 'review', label: '리뷰' },
    ],
    []
  );

  useEffect(() => {
    const queryTab = router.query.service as string;
    if (queryTab && TABS.some((tab) => tab.id === queryTab)) {
      setActiveTab(queryTab);
    }
  }, [router.query.service, TABS]);

  const handleTabClick = (tabId: string) => {
    router.replace({ query: { ...router.query, service: tabId } }, undefined, { shallow: true });
    setActiveTab(tabId);
  };

  return (
    <Layout>
      <AppBar onBackClick={router.back} showBackButton={true} title="MEDITRIP" />
      <ClinicDetail
        badges={['한의원', '침 치료']}
        clinicImage={''}
        clinicName={'한의원 이름 1'}
        clinicAddress={'한의원 주소 1'}
      />
      <section css={wrapper}>
        <div css={content}>
          <Tabs
            tabs={TABS}
            renderContent={renderContent}
            activeTabId={activeTab}
            onTabClick={handleTabClick}
          />
        </div>
      </section>
    </Layout>
  );
}

const wrapper = css`
  display: flex;
  flex-direction: column;
  flex: 1;

  background: ${theme.colors.white};

  h1 {
    margin: 0 18px;
  }
`;

const content = css`
  width: 100%;
  height: 100%;
`;
