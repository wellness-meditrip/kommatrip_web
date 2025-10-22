import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout, AppBar, SearchBar, Text, CompanyCard, GNB, CompanyList } from '@/components';

import { theme } from '@/styles';
import { css } from '@emotion/react';

// 홈 페이지
export default function HomePage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };
  return (
    <Layout isAppBarExist={false}>
      {/* 통합 헤더 영역 */}
      <div css={headerSection}>
        <AppBar onBackClick={router.back} showBackButton={false} logo={true} />
        <div css={heroContent}>
          <Text typo="title_L" color="white" css={heroTitle}>
            Discover Authentic Korean Wellness
          </Text>
        </div>
        <div css={searchBarWrapper}>
          <SearchBar
            onValueChange={handleValueChange}
            placeholder="Search spas, clinics, treatments..."
          />
        </div>
      </div>

      <div css={wrapper}>
        <CompanyList
          title="Recently Viewed"
          companies={[
            {
              hospital_id: 1,
              hospital_name: 'Clinic Name',
              address: 'Clinic Address',
              rating: 4.5,
              image_url: 'https://via.placeholder.com/150',
              departments: ['badge1', 'badge2'],
            },
            {
              hospital_id: 2,
              hospital_name: 'Clinic Name 2',
              address: 'Clinic Address 2',
              rating: 4.5,
              image_url: 'https://via.placeholder.com/150',
              departments: ['badge3', 'badge4'],
            },
            {
              hospital_id: 3,
              hospital_name: 'Clinic Name 3',
              address: 'Clinic Address 3',
              rating: 4.5,
              image_url: 'https://via.placeholder.com/150',
              departments: ['badge5', 'badge6'],
            },
          ]}
        />
        <Text typo="title_M" color="text_primary" css={title}>
          Recommended for You
        </Text>
        <div css={cardsGrid}>
          <CompanyCard
            clinicId={1}
            clinicImage="https://via.placeholder.com/150"
            clinicName="Clinic Name"
            clinicAddress="Clinic Address"
            badges={['badge1', 'badge2']}
            onClick={() => {}}
          />
          <CompanyCard
            clinicId={2}
            clinicImage="https://via.placeholder.com/150"
            clinicName="Clinic Name 2"
            clinicAddress="Clinic Address 2"
            badges={['badge3', 'badge4']}
            onClick={() => {}}
          />
          <CompanyCard
            clinicId={3}
            clinicImage="https://via.placeholder.com/150"
            clinicName="Clinic Name 3"
            clinicAddress="Clinic Address 3"
            badges={['badge5', 'badge6']}
            onClick={() => {}}
          />
        </div>
      </div>
      <GNB />
    </Layout>
  );
}

// 통합 헤더 영역
export const headerSection = css`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;

  background: linear-gradient(135deg, #2d3e36 0%, #476155 50%, #749a88 100%);
  /* background-image: url('/candle-bg.jpg'); */
  /* background-size: cover;
  background-position: center;
  background-repeat: no-repeat; */

  > * {
    position: relative;
    z-index: 2;
  }
`;

export const heroContent = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  justify-content: center;

  margin: calc(${theme.size.appBarHeight} + 34px) 0 20px 0;
  gap: 16px;
`;

export const heroTitle = css`
  color: ${theme.colors.white};
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const title = css`
  align-self: flex-start;
  margin-bottom: 20px;
`;

export const searchBarWrapper = css`
  width: 100%;
  margin: 0 auto;
  flex-shrink: 0;
`;

export const cardsGrid = css`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  justify-items: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
`;

export const wrapper = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;

  width: 100%;
  height: 100%;

  padding: 24px;

  background-color: ${theme.colors.bg_default};
`;

export const bottom = css`
  position: absolute;
  bottom: 0;

  width: 100%;
  height: 18px;
`;
