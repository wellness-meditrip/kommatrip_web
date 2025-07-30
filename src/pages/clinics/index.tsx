import { AppBar } from '@/components/app-bar';
import { GNB } from '@/components/common/gnb';
import { Layout } from '@/components/layout';
import SearchBar from '@/components/search/search-bar';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import ClinicCard from '@/components/clinic/clinic-card';
import { ROUTES } from '@/constants/commons/routes';
import { TextButton } from '@/components/text-button';
import { ArrowUpdown } from '@/icons';
import { Text } from '@/components/text';

// 병원 리스트 페이지
export default function ClinicListPage() {
  const router = useRouter();
  const [childValue, setChildValue] = useState('');

  const handleValueChange = (value: string) => {
    setChildValue(value);
  };
  return (
    <Layout isAppBarExist={true}>
      <AppBar onBackClick={router.back} showBackButton={false} title="한의원" />
      <SearchBar onValueChange={handleValueChange} />
      <div css={wrapper}>
        <TextButton icons={{ prefix: <ArrowUpdown width={16} height={16} /> }}>
          <Text typo="button_M" color="text_tertiary">
            별점 낮은 순
          </Text>
        </TextButton>

        <ClinicCard
          clinicId={1}
          badges={['한의원', '침 치료']}
          onClick={(partnerId: number) => {
            router.push(ROUTES.CLINICS_DETAIL(partnerId));
          }}
          clinicImage={''}
          clinicName={'한의원 이름 1'}
          clinicAddress={'한의원 주소 1'}
        />
        <ClinicCard
          clinicId={2}
          badges={['한의원', '약침']}
          onClick={(partnerId: number) => {
            router.push(ROUTES.CLINICS_DETAIL(partnerId));
          }}
          clinicImage={''}
          clinicName={'한의원 이름 2'}
          clinicAddress={'한의원 주소 2'}
        />
        <ClinicCard
          clinicId={3}
          badges={['한의원', '추나요법']}
          onClick={(partnerId: number) => {
            router.push(ROUTES.CLINICS_DETAIL(partnerId));
          }}
          clinicImage={''}
          clinicName={'한의원 이름 3'}
          clinicAddress={'한의원 주소 3'}
        />
      </div>
      <GNB />
    </Layout>
  );
}

export const wrapper = css`
  overflow-y: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: ${theme.colors.bg_surface1};
  padding: 104px 20px 80px;
  gap: 24px;
`;
