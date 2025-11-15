import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import CompanyDetail from '@/components/company/company-detail';
import { useRouter } from 'next/router';
import { CompanyInfo, CompanyReview, CompanyProgram } from '@/components/company-detail';
import { useEffect, useState, useMemo } from 'react';
import { Loading, Tabs } from '@/components';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { GetCompanyDetailResponse } from '@/models';
import { css } from '@emotion/react';
import { theme } from '@/styles';

export default function ClinicDetailPage() {
  const router = useRouter();
  const { companyId } = router.query;

  const companyIdNumber = Number(companyId);

  const params = {
    companyId: companyIdNumber,
  };

  const { data, error } = useGetCompanyDetailQuery(params) as {
    data: GetCompanyDetailResponse | undefined;
    error: Error | null;
  };
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
      {data?.data?.company && (
        <CompanyDetail
          badges={data.data.company.tags || []}
          companyImage={data.data.company.primary_image_url || '/default.png'}
          companyName={data.data.company.name}
          companyAddress={data.data.company.address}
          images={data.data.company.image_urls || []}
        />
      )}

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
