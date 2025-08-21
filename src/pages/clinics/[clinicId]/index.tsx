import { AppBar } from '@/components/app-bar';
import { Layout } from '@/components/layout';
import ClinicDetail from '@/components/clinic/clinic-detail';
import { useRouter } from 'next/router';
import { ClinicInfo, ClinicReview } from '@/components/clinic-detail';
import { useEffect, useState, useMemo } from 'react';
import { Tabs } from '@/components';
import { useGetClinicClinicIdQuery } from '@/queries';
import { wrapper, content } from './index.styles';
// import { ROUTES } from '@/constants/commons';

export default function ClinicDetailPage() {
  const router = useRouter();
  const { clinicId } = router.query;

  const clinicIdNumber = Number(clinicId);

  const params = {
    hospitalId: clinicIdNumber,
  };

  const { data } = useGetClinicClinicIdQuery(params);
  // 비회원 검증 로직
  // const { data: isValidUser, isSuccess } = useGetUserValidateQuery();

  // useEffect(() => {
  //   if (!isValidUser?.isValidateMember && isSuccess) {
  //     router.replace(ROUTES.LOGIN);
  //   }
  // }, [isSuccess, isValidUser]);

  const [activeTab, setActiveTab] = useState<string>('info');

  const renderContent = (activeTabId: string) => {
    if (!data) return null;
    switch (activeTabId) {
      case 'info':
        return <ClinicInfo clinicData={data} />;
      case 'review':
        return <ClinicReview hospitalId={data.hospital_id} />;
      default:
        return <ClinicInfo clinicData={data} />;
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
      {data?.hospital_details?.map((clinic, index) => {
        const mainImage = clinic.images?.find((img) => img.is_main)?.image_url ?? '';
        return (
          <ClinicDetail
            key={clinic.id || index}
            badges={clinic.departments?.map((d) => d.name) || []}
            clinicImage={mainImage}
            clinicName={data.hospital_name}
            clinicAddress={data.address}
          />
        );
      })}

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
