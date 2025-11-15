import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import CompanyDetail from '@/components/company/company-detail';
import { useRouter } from 'next/router';
import { CompanyInfo, CompanyReview, CompanyProgram } from '@/components/company-detail';
import { useEffect, useState, useMemo } from 'react';
import { Tabs } from '@/components';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { css } from '@emotion/react';
import { theme } from '@/styles';

export default function ClinicDetailPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const companyIdNumber = Number(companyId);

  const params = {
    companyId: companyIdNumber,
  };

  const { data, error } = useGetCompanyDetailQuery(params);
  const [activeTab, setActiveTab] = useState<string>('info');

  const TABS = useMemo(
    () => [
      { id: 'info', label: 'Information' },
      { id: 'program', label: 'Programs' },
      { id: 'review', label: 'Reviews' },
    ],
    []
  );

  useEffect(() => {
    const queryTab = router.query.service as string;
    if (queryTab && TABS.some((tab) => tab.id === queryTab)) {
      setActiveTab(queryTab);
    }
  }, [router.query.service, TABS]);

  // 비회원 검증 로직
  // const { data: isValidUser, isSuccess } = useGetUserValidateQuery();

  // useEffect(() => {
  //   if (!isValidUser?.isValidateMember && isSuccess) {
  //     router.replace(ROUTES.LOGIN);
  //   }
  // }, [isSuccess, isValidUser]);

  const renderContent = (activeTabId: string) => {
    switch (activeTabId) {
      case 'info':
        return data?.data?.company ? (
          <CompanyInfo data={data.data.company} />
        ) : (
          <div>데이터를 불러오는 중...</div>
        );
      case 'program':
        return data?.data?.company ? (
          <CompanyProgram badges={data.data.company.tags || []} />
        ) : (
          <div>데이터를 불러오는 중...</div>
        );
      case 'review':
        return <CompanyReview />;
      default:
        return data?.data?.company ? (
          <CompanyInfo data={data.data.company} />
        ) : (
          <div>데이터를 불러오는 중...</div>
        );
    }
  };

  const handleTabClick = (tabId: string) => {
    router.replace({ query: { ...router.query, service: tabId } }, undefined, { shallow: true });
    setActiveTab(tabId);
  };

  // router가 준비되지 않았거나 companyId가 없으면 로딩 표시
  if (!router.isReady || !companyId || isNaN(companyIdNumber)) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} />
        <div>
          Loading... (router: {router.isReady ? 'ready' : 'not ready'}, companyId: {companyId})
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} />
        <div>Error loading data</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <AppBar onBackClick={router.back} leftButton={true} />
        <div>No data found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AppBar onBackClick={router.back} leftButton={true} />
      {data?.data?.company && (
        <CompanyDetail
          badges={data.data.company.tags || []}
          companyImage="/default.png"
          companyName={data.data.company.name}
          companyAddress={data.data.company.address}
        />
      )}

      {/* 나중에 이미지 배열이 추가되면 아래 코드로 변경:
      {data?.company?.images?.map((image, index) => (
        <ClinicDetail
          key={image.id || index}
          badges={data.company.tags || []}
          clinicImage={image.image_url}
          clinicName={data.company.name}
          clinicAddress={data.company.address}
        />
      ))}
      */}

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

  background: ${theme.colors.white};

  h1 {
    margin: 0 18px;
  }
`;

const content = css`
  width: 100%;

  background: ${theme.colors.bg_surface1};
`;
